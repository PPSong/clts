DROP PROCEDURE IF EXISTS throwError; 
CREATE PROCEDURE throwError(IN msg VARCHAR(256))
BEGIN
SIGNAL SQLSTATE
    'ERROR'
SET
    MESSAGE_TEXT = msg,
    MYSQL_ERRNO = '1234';
END; 

DROP PROCEDURE IF EXISTS clearSnapShotAndDDRelatedData; 
CREATE PROCEDURE clearSnapShotAndDDRelatedData(IN v_DDId INT)
BEGIN
	-- 清空和订单相关的Snapshot
    DELETE 
    FROM 
		DD_DW_DPSnapshot
	WHERE
		DDId = v_DDId;
        
	DELETE 
    FROM 
		DD_GT_FGTesterSnapshot
	WHERE
		DDId = v_DDId;
        
	DELETE 
    FROM 
		DD_GT_WLSnapshot
	WHERE
		DDId = v_DDId;
        
	-- 清空和订单相关的DD_DW_DP
    DELETE 
    FROM 
		DD_DW_DP
	WHERE
		DDId = v_DDId;
        
	-- 清空和订单相关的DD_GT_WL
    DELETE 
    FROM 
		DD_GT_WL
	WHERE
		DDId = v_DDId;
END; 

DROP PROCEDURE IF EXISTS genDDRelatedData; 
CREATE PROCEDURE genDDRelatedData(IN v_DDId INT, IN v_lastDDId INT, IN v_now DATETIME(3))
BEGIN
	-- 创建和订单相关的Snapshot
	INSERT
    INTO
		DD_DW_DPSnapshot
        (DDId, DWId, DPId, createdAt, updatedAt)
    SELECT
		v_DDId,
        DWId, 
        DPId, 
        v_now, 
        v_now
	FROM 
		V_DW_DP
    WHERE
		DPId IS NOT NULL;
    
	INSERT
    INTO
		DD_GT_FGTesterSnapshot
        (DDId, GTId, FGTesterId, number, createdAt, updatedAt)
    SELECT
		v_DDId,
        GTId, 
        FGTesterId,
        FGTesterTotal number,
        v_now, 
        v_now
	FROM 
		V_GT_FGTester
	WHERE
		FGTesterId IS NOT NULL;
    
    INSERT
    INTO
		DD_GT_WLSnapshot
        (DDId, GTId, WLId, number, createdAt, updatedAt)
    SELECT
		v_DDId,
        GTId, 
        WLId,
        WLTotal number,
        v_now, 
        v_now
	FROM 
		V_GT_WL
	WHERE
		WLId IS NOT NULL;
        
        
	-- 创建和订单相关的DP
    INSERT
    INTO
		DD_DW_DP
        (DDId, DWId, DPId, createdAt, updatedAt)
	SELECT
		aaa.DDId,
		aaa.DWId,
		aaa.DPId,
        v_now, 
        v_now
	FROM
		(
		SELECT
			aa.DDId,
			aa.DWId,
			aa.DPId
		FROM
			(
			-- 当次订单状态
			SELECT
				a.DDId,
				a.DWId,
				a.DPId
			FROM
				DD_DW_DPSnapshot a
			WHERE 
				-- 当次订单Id
				a.DDId = v_DDId
			) AS aa
		LEFT JOIN
			(
			-- 上次订单状态结合当次翻新柜台修正状态
			SELECT
				aa.DDId,
				aa.DWId,
				aa.DPId
			FROM
				(
				SELECT
					a.DDId,
					b.GTId,
					a.DWId,
					a.DPId
				FROM
					DD_DW_DPSnapshot a
				JOIN
					DW b
				ON
					a.DWId = b.id
				WHERE
					-- 上次订单Id
					a.DDId = v_lastDDId
				) AS aa
			LEFT JOIN
				DD_GTFX bb
			ON
				-- 当前订单Id
				bb.DDId = v_DDId
			AND
				aa.GTId = bb.GTId
			WHERE
				bb.GTId IS NULL
			) AS bb
		ON
			aa.DWId = bb.DWId
		AND
			aa.DPId = bb.DPId
		WHERE
			bb.DWId IS NULL
		) AS aaa;
    
    -- 创建和订单相关的WL
    INSERT
    INTO
		DD_GT_WL
        (DDId, GTId, WLId, number, createdAt, updatedAt)
	SELECT
		aaa.DDId,
		aaa.GTId,
		aaa.WLId,
		aaa.number,
		v_now, 
        v_now
	FROM
		(
		SELECT
			aa.DDId,
			aa.GTId,
			aa.WLId,
			(aa.number - IF(bb.number IS NULL, 0, bb.number)) number
		FROM
			(
			-- 当次订单状态
			SELECT
				a.DDId,
				a.GTId,
				a.WLId,
				a.number
			FROM
				DD_GT_WLSnapshot a
			WHERE 
				-- 当次订单Id
				a.DDId = v_DDId
			) AS aa
		LEFT JOIN
			(
			-- 上次订单状态结合当次翻新柜台修正状态
			SELECT
				a.DDId,
				a.GTId,
				a.WLId,
				a.number
			FROM
				DD_GT_WLSnapshot a
			LEFT JOIN
				DD_GTFX b
			ON
				a.GTId = b.GTId
			AND 
				-- 当次订单Id
				b.DDId = v_DDId
			WHERE 
				-- 上次订单Id
				a.DDId = v_lastDDId
			AND
				b.GTId IS NULL
			) AS bb
		ON
			aa.GTId = bb.GTId
		AND
			aa.WLId = bb.WLId
		) AS aaa
	WHERE
		aaa.number > 0;
END; 

DROP PROCEDURE IF EXISTS genDD; 
CREATE PROCEDURE genDD(IN v_PPId INT, IN v_name CHAR(255) CHARSET utf8)
BEGIN
	DECLARE code CHAR(5) DEFAULT '00000';
    DECLARE msg TEXT;
	DECLARE v_unApprovedDDCount INT DEFAULT 0;
    DECLARE v_DDId INT DEFAULT 0;
	DECLARE v_lastDDId INT DEFAULT 0;
    DECLARE v_now DATETIME(3) DEFAULT NOW();
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        
		GET DIAGNOSTICS CONDITION 1
		code = RETURNED_SQLSTATE, msg = MESSAGE_TEXT;
		SELECT 
			0 code,
			CONCAT(code, ':' ,msg) msg;
    END;
    
    START TRANSACTION;
    
	-- 如果当前品牌还有未审核通过的DD则报错
    SELECT
		COUNT(*) INTO v_unApprovedDDCount
	FROM
		DD a
	WHERE
		a.PPId = v_PPId
	AND
		a.status != '已审批';
        
	IF v_unApprovedDDCount > 0 THEN
		CALL throwError('该品牌还有未审批通过的DD, 不能新建DD');
    END IF;

	INSERT 
	INTO
		DD
		(name, status, PPId, createdAt, updatedAt)
	VALUES
		-- todo: 用status变量
		(v_name, '待审批', v_PPId, v_now, v_now); 
		
	-- 取得新插入记录id
	SET v_DDId = LAST_INSERT_ID();
    
     -- 上次订单ID
	SELECT
		MAX(id) id into v_lastDDId
	FROM
		DD a
	WHERE
		a.PPId = v_PPId
	AND
		a.status = '已审批';
    
    CALL genDDRelatedData(v_DDId, v_lastDDId, v_now);
    
    SELECT 
		1 code,
		'ok' msg;	
    
    COMMIT;
    
END; 

DROP PROCEDURE IF EXISTS reGenDD; 
CREATE PROCEDURE reGenDD(IN v_DDId INT)
BEGIN
	DECLARE code CHAR(5) DEFAULT '00000';
    DECLARE msg TEXT;
	DECLARE v_lastDDId INT DEFAULT 0;
    DECLARE v_statue CHAR(255);
    DECLARE v_now DATETIME(3) DEFAULT NOW();
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        
		GET DIAGNOSTICS CONDITION 1
		code = RETURNED_SQLSTATE, msg = MESSAGE_TEXT;
		SELECT 
			0 code,
			CONCAT(code, ':' ,msg) msg;
    END;
    
    START TRANSACTION;
    
	-- 如果此订单状态是'已审批'则报错
    SELECT
		status INTO v_statue
	FROM
		DD a
	WHERE
		a.id = v_DDId;
        
	-- todo: 用status变量
	IF v_statue = '已审批' THEN
		CALL throwError('不能重新生成已审批的订单');
    END IF;

	UPDATE
		DD
	SET
		updateAt = v_now
	WHERE
		id = v_DDId;
    
	-- 上次订单ID
	SELECT
		MAX(id) id into v_lastDDId
	FROM
		DD a
	WHERE
		a.PPId = v_PPId
	AND
		a.status = '已审批';
    
    CALL clearSnapShotAndDDRelatedData(v_DDId);
    CALL genDDRelatedData(v_DDId, v_lastDDId);
    
	SELECT 
		1 code,
		'ok' msg;	
        
    COMMIT;
    
END; 