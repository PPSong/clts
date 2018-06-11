USE cltp;

DROP PROCEDURE IF EXISTS throwError; 
CREATE PROCEDURE throwError(IN msg VARCHAR(256) CHARACTER SET utf8)
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
CREATE PROCEDURE genDDRelatedData(IN v_PPId INT, IN v_DDId INT, IN v_lastDDId INT, IN v_now DATETIME(3))
BEGIN
	-- 创建和订单相关的Snapshot
	INSERT
    INTO
		DD_DW_DPSnapshot
        (DDId, DWId, DPId, GTId, PPId, DPName, DPImageUrl, CZ, CC, createdAt, updatedAt)
    SELECT
		v_DDId,
        a.DWId, 
        a.DPId,
        c.id GTId,
		d.id PPId,
        a.DPName,
        a.DPImageUrl,
		b.CZ,
		b.CC,
        v_now, 
        v_now
	FROM 
		V_DW_DP a
	JOIN
		DW b
	ON
		a.DWId = b.id
	JOIN
		GT c
	ON
		b.GTId = c.id
	JOIN
		PP d
	ON
		c.PPId = d.id
    WHERE
		c.PPId = v_PPId
	AND
		a.DPId IS NOT NULL;
    
	INSERT
    INTO
		DD_GT_FGTesterSnapshot
        (DDId, GTId, PPId, FGTesterId, number, createdAt, updatedAt)
    SELECT
		v_DDId,
        a.GTId, 
        b.PPId, 
        a.FGTesterId,
        a.FGTesterTotal number,
        v_now, 
        v_now
	FROM 
		V_GT_FGTester a
	JOIN
		GT b
	ON
		a.GTId = b.id
	WHERE
		b.PPId = v_PPId
	AND
		a.FGTesterId IS NOT NULL;
    
    INSERT
    INTO
		DD_GT_WLSnapshot
        (DDId, GTId, WLId, PPId, number, createdAt, updatedAt)
    SELECT
		v_DDId,
        a.GTId, 
        a.WLId,
		b.PPId PPId,
        a.WLTotal number,
        v_now, 
        v_now
	FROM 
		V_GT_WL a
	JOIN
		GT b
	ON
		a.GTId = b.id
	WHERE
		b.PPId = v_PPId
	AND
		WLId IS NOT NULL;   
        
	-- 创建和订单相关的DP
    INSERT
    INTO
		DD_DW_DP
        (DDId, DWId, DPId, CZ, CC, GYSId, status, ZXNumber, createdAt, updatedAt)
	SELECT
		aaa.DDId,
		aaa.DWId,
		aaa.DPId,
		ccc.CZ,
		ccc.CC,
        bbb.GYSId,
		'_DD_DW_DPStatus.CS_',
		0,
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
				PP_GTFX bb
			ON
				-- 当前订单PPId
				bb.PPId = v_PPId
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
		) AS aaa
	LEFT JOIN
		DP bbb
	ON
		aaa.DPId = bbb.id
	LEFT JOIN
		DW ccc
	ON
		aaa.DWId = ccc.id;
    
    -- 创建和订单相关的WL
    INSERT
    INTO
		DD_GT_WL
        (DDId, GTId, WLId, number, GYSId, status, ZXNumber, createdAt, updatedAt)
	SELECT
		aaa.DDId,
		aaa.GTId,
		aaa.WLId,
		aaa.number,
		bbb.GYSId,
		'_DD_GT_WLStatus.CS_',
		0,
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
				PP_GTFX b
			ON
				a.GTId = b.GTId
			AND 
				-- 当次订单PPId
				b.PPId = v_PPId
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
	LEFT JOIN
		WL bbb
	ON
		aaa.WLId = bbb.id
	WHERE
		aaa.number > 0;
END; 

DROP PROCEDURE IF EXISTS genDD; 
CREATE PROCEDURE genDD(IN v_PPId INT, IN v_name CHAR(255) CHARACTER SET utf8)
BEGIN
	DECLARE code CHAR(5) DEFAULT '00000';
    DECLARE msg TEXT CHARACTER SET utf8;
    -- _DDStatus.CS_由调用的js代码做变量替换
    DECLARE v_init_status CHAR(255) CHARACTER SET utf8 DEFAULT '_DDStatus.CS_';
    -- _DDStatus.CS_由调用的js代码做变量替换
    DECLARE v_end_status CHAR(255) CHARACTER SET utf8 DEFAULT '_DDStatus.YSP_';
	DECLARE v_unApprovedDDCount INT DEFAULT 0;
    DECLARE v_DDId INT DEFAULT 0;
	DECLARE v_lastDDId INT DEFAULT 0;
    DECLARE v_now DATETIME(3) DEFAULT NOW();
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION, SQLWARNING
    BEGIN
		GET DIAGNOSTICS CONDITION 1
		code = RETURNED_SQLSTATE, msg = MESSAGE_TEXT;
		SELECT 
			0 code,
			CONCAT(code, ':' ,msg) msg;
		
        ROLLBACK;
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
		a.status != v_end_status;
        
	IF v_unApprovedDDCount > 0 THEN
		CALL throwError('该品牌还有未审批通过的DD, 不能新建DD');
    END IF;

	INSERT 
	INTO
		DD
		(name, status, PPId, createdAt, updatedAt)
	VALUES
		(v_name, v_init_status, v_PPId, v_now, v_now); 
		
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
		a.status = v_end_status;
    
    CALL genDDRelatedData(v_PPId, v_DDId, v_lastDDId, v_now);
    
    SELECT 
		1 code,
		'ok' msg;	
    
    COMMIT;
    
END; 

DROP PROCEDURE IF EXISTS reGenDD; 
CREATE PROCEDURE reGenDD(IN v_DDId INT)
BEGIN
	DECLARE code CHAR(5) DEFAULT '00000';
    DECLARE msg TEXT CHARACTER SET utf8;
    -- _DDStatus.YSP_由调用的js代码做变量替换
    DECLARE v_end_status CHAR(255) CHARACTER SET utf8 DEFAULT '_DDStatus.YSP_';
    DECLARE v_PPId INT DEFAULT 0;
	DECLARE v_lastDDId INT DEFAULT 0;
    DECLARE v_status CHAR(255) CHARACTER SET utf8;
    DECLARE v_now DATETIME(3) DEFAULT NOW();
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION, SQLWARNING
    BEGIN
		GET DIAGNOSTICS CONDITION 1
		code = RETURNED_SQLSTATE, msg = MESSAGE_TEXT;
        
		SELECT 
			0 code,
			CONCAT(code, ':' ,msg) msg;
            
		ROLLBACK;
    END;
    
    START TRANSACTION;
    
	-- 如果此订单状态是'已审批'则报错
    SELECT
		a.PPId, a.status 
	INTO
		v_PPId, v_status
	FROM
		DD a
	WHERE
		a.id = v_DDId;
    
	IF v_status = v_end_status THEN
		CALL throwError('不能重新生成已审批的订单');
    END IF;

	UPDATE
		DD
	SET
		updatedAt = v_now
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
		a.status = v_end_status;
    
    CALL clearSnapShotAndDDRelatedData(v_DDId);
    CALL genDDRelatedData(v_PPId, v_DDId, v_lastDDId, v_now);
    
	SELECT 
		1 code,
		'ok' msg;	
        
    COMMIT;
    
END; 

DROP PROCEDURE IF EXISTS queryGTWuLiusByGYS; 
CREATE PROCEDURE queryGTWuLiusByGYS(IN v_GYSId INT, IN v_curPage INT, IN v_perPage INT, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	declare v_offset int default 0;

	SET v_offset = v_curPage * v_perPage;

	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_DW_DPSnapshot a
				JOIN
					DD_DW_DP b
				ON 
					a.DDId = b.DDId AND a.DWId = b.DWId AND a.DPId = b.DPId
				WHERE 
					b.GYSId = v_GYSId
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_GT_WLSnapshot a
				JOIN
					DD_GT_WL b
				ON 
					a.DDId = b.DDId AND a.GTId = b.GTId AND a.WLId = b.WLId
				WHERE 
					b.GYSId = v_GYSId
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'WL' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				WLBH a 
			JOIN
				WL b
			ON
				a.WLId = b.id
			WHERE
				YJZXTime IS NOT NULL AND ((a.GYSId IS NULL AND b.GYSId = v_GYSId) OR a.GYSId = v_GYSId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'DP' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				DPBH a 
			JOIN
				DP b
			ON
				a.DPId = b.id
			WHERE
				YJZXTime IS NOT NULL AND ((a.GYSId IS NULL AND b.GYSId = v_GYSId) OR a.GYSId = v_GYSId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	LIMIT v_perPage
	OFFSET v_offset;
    
END; 

DROP PROCEDURE IF EXISTS queryGTWuLiusByKFJL; 
CREATE PROCEDURE queryGTWuLiusByKFJL(IN v_UserId INT, IN v_curPage INT, IN v_perPage INT, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	declare v_offset int default 0;

	SET v_offset = v_curPage * v_perPage;

	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_DW_DPSnapshot a
				WHERE 
					a.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_GT_WLSnapshot a
				WHERE 
					a.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'WL' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				WLBH a 
			JOIN
				WL b
			ON
				a.WLId = b.id
			WHERE
				YJZXTime IS NOT NULL AND b.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'DP' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				DPBH a 
			JOIN
				DP b
			ON
				a.DPId = b.id
			WHERE
				YJZXTime IS NOT NULL AND b.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	LIMIT v_perPage
	OFFSET v_offset;
    
END; 


DROP PROCEDURE IF EXISTS queryGTWuLiusByPPJL; 
CREATE PROCEDURE queryGTWuLiusByPPJL(IN v_UserId INT, IN v_curPage INT, IN v_perPage INT, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	declare v_offset int default 0;

	SET v_offset = v_curPage * v_perPage;

	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_DW_DPSnapshot a
				WHERE 
					a.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_GT_WLSnapshot a
				WHERE 
					a.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'WL' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				WLBH a 
			JOIN
				WL b
			ON
				a.WLId = b.id
			WHERE
				YJZXTime IS NOT NULL AND b.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'DP' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				DPBH a 
			JOIN
				DP b
			ON
				a.DPId = b.id
			WHERE
				YJZXTime IS NOT NULL AND b.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	LIMIT v_perPage
	OFFSET v_offset;
    
END; 

DROP PROCEDURE IF EXISTS queryGTWuLiusByAZGS; 
CREATE PROCEDURE queryGTWuLiusByAZGS(IN v_AZGSId INT, IN v_curPage INT, IN v_perPage INT, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	declare v_offset int default 0;

	SET v_offset = v_curPage * v_perPage;

	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_DW_DPSnapshot a
				JOIN
					DD_DW_DP b
				ON 
					a.DDId = b.DDId AND a.DWId = b.DWId AND a.DPId = b.DPId
				WHERE 
					b.AZGSId = v_AZGSId
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_GT_WLSnapshot a
				JOIN
					DD_GT_WL b
				ON 
					a.DDId = b.DDId AND a.GTId = b.GTId AND a.WLId = b.WLId
				WHERE 
					b.AZGSId = v_AZGSId
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'WL' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				WLBH a 
			JOIN
				WL b
			ON
				a.WLId = b.id
			WHERE
				YJZXTime IS NOT NULL AND a.AZGSId = v_AZGSId
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'DP' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				DPBH a 
			JOIN
				DP b
			ON
				a.DPId = b.id
			WHERE
				YJZXTime IS NOT NULL AND a.AZGSId = v_AZGSId
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	LIMIT v_perPage
	OFFSET v_offset;
    
END; 

DROP PROCEDURE IF EXISTS queryGTWuLiusByGYS; 
CREATE PROCEDURE queryGTWuLiusByGYS(IN v_GYSId INT, IN v_curPage INT, IN v_perPage INT, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	declare v_offset int default 0;

	SET v_offset = v_curPage * v_perPage;

	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_DW_DPSnapshot a
				JOIN
					DD_DW_DP b
				ON 
					a.DDId = b.DDId AND a.DWId = b.DWId AND a.DPId = b.DPId
				WHERE 
					b.GYSId = v_GYSId
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_GT_WLSnapshot a
				JOIN
					DD_GT_WL b
				ON 
					a.DDId = b.DDId AND a.GTId = b.GTId AND a.WLId = b.WLId
				WHERE 
					b.GYSId = v_GYSId
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'WL' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				WLBH a 
			JOIN
				WL b
			ON
				a.WLId = b.id
			WHERE
				YJZXTime IS NOT NULL AND ((a.GYSId IS NULL AND b.GYSId = v_GYSId) OR a.GYSId = v_GYSId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'DP' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				DPBH a 
			JOIN
				DP b
			ON
				a.DPId = b.id
			WHERE
				YJZXTime IS NOT NULL AND ((a.GYSId IS NULL AND b.GYSId = v_GYSId) OR a.GYSId = v_GYSId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	LIMIT v_perPage
	OFFSET v_offset;
    
END; 


DROP PROCEDURE IF EXISTS queryGTWuLius; 
CREATE PROCEDURE queryGTWuLius(IN v_curPage INT, IN v_perPage INT, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	declare v_offset int default 0;

	SET v_offset = v_curPage * v_perPage;

	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_DW_DPSnapshot a
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, type, task
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, max(type) type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				'WL' type,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_GT_WLSnapshot a
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'WL' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				WLBH a 
			JOIN
				WL b
			ON
				a.WLId = b.id
			WHERE
				YJZXTime IS NOT NULL
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	UNION
	
	SELECT
		DDorBHKey, name, GTId, GT_name, GT_code, PPId, PP_name, 'DP' as type, '补货' as task
	FROM (
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				DPBH a 
			JOIN
				DP b
			ON
				a.DPId = b.id
			WHERE
				YJZXTime IS NOT NULL
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE 
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword
		
	LIMIT v_perPage
	OFFSET v_offset;
    
END; 

DROP PROCEDURE IF EXISTS countGTWuLius; 
CREATE PROCEDURE countGTWuLius(IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	SELECT
		count(*) total
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'DP' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_DW_DPSnapshot a
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'WL' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_GT_WLSnapshot a
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'WL' type, '补货' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				WLBH a 
			JOIN
				WL b
			ON
				a.WLId = b.id
			WHERE
				YJZXTime IS NOT NULL
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'DP' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				DPBH a 
			JOIN
				DP b
			ON
				a.DPId = b.id
			WHERE
				YJZXTime IS NOT NULL
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword;
    
END; 

DROP PROCEDURE IF EXISTS countGTWuLiusByPPJL; 
CREATE PROCEDURE countGTWuLiusByPPJL(IN v_UserId INT, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	SELECT
		count(*) total
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'DP' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_DW_DPSnapshot a
				WHERE 
					a.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'WL' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_GT_WLSnapshot a
				WHERE 
					a.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'WL' type, '补货' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				WLBH a 
			JOIN
				WL b
			ON
				a.WLId = b.id
			WHERE
				YJZXTime IS NOT NULL AND b.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'DP' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				DPBH a 
			JOIN
				DP b
			ON
				a.DPId = b.id
			WHERE
				YJZXTime IS NOT NULL AND b.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword;
    
END; 


DROP PROCEDURE IF EXISTS countGTWuLiusByKFJL; 
CREATE PROCEDURE countGTWuLiusByKFJL(IN v_UserId INT, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	SELECT
		count(*) total
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'DP' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_DW_DPSnapshot a
				WHERE 
					a.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'WL' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_GT_WLSnapshot a
				WHERE 
					a.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'WL' type, '补货' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				WLBH a 
			JOIN
				WL b
			ON
				a.WLId = b.id
			WHERE
				YJZXTime IS NOT NULL AND b.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'DP' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				DPBH a 
			JOIN
				DP b
			ON
				a.DPId = b.id
			WHERE
				YJZXTime IS NOT NULL AND b.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword;
    
END; 

DROP PROCEDURE IF EXISTS countGTWuLiusByGYS; 
CREATE PROCEDURE countGTWuLiusByGYS(IN v_GYSId INT, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	SELECT
		count(*) total
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'DP' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_DW_DPSnapshot a
				JOIN
					DD_DW_DP b
				ON 
					a.DDId = b.DDId AND a.DWId = b.DWId AND a.DPId = b.DPId
				WHERE 
					b.GYSId = v_GYSId
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'WL' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_GT_WLSnapshot a
				JOIN
					DD_GT_WL b
				ON 
					a.DDId = b.DDId AND a.GTId = b.GTId AND a.WLId = b.WLId
				WHERE 
					b.GYSId = v_GYSId
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'WL' type, '补货' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				WLBH a 
			JOIN
				WL b
			ON
				a.WLId = b.id
			WHERE
				YJZXTime IS NOT NULL AND ((a.GYSId IS NULL AND b.GYSId = v_GYSId) OR a.GYSId = v_GYSId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'DP' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				DPBH a 
			JOIN
				DP b
			ON
				a.DPId = b.id
			WHERE
				YJZXTime IS NOT NULL AND ((a.GYSId IS NULL AND b.GYSId = v_GYSId) OR a.GYSId = v_GYSId)
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword;
    
END; 

DROP PROCEDURE IF EXISTS countGTWuLiusByAZGS; 
CREATE PROCEDURE countGTWuLiusByAZGS(IN v_AZGSId INT, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	SELECT
		count(*) total
	FROM (
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'DP' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_DW_DPSnapshot a
				JOIN
					DD_DW_DP b
				ON 
					a.DDId = b.DDId AND a.DWId = b.DWId AND a.DPId = b.DPId
				WHERE 
					b.AZGSId = v_AZGSId
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.DDId) DDorBHKey, max(a.DD_name) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'WL' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT 
				a.DDId,
				a.GTId,
				b.PPId,
				b.name DD_name,
				b.status
			FROM (
				SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId
				FROM
					DD_GT_WLSnapshot a
				JOIN
					DD_GT_WL b
				ON 
					a.DDId = b.DDId AND a.GTId = b.GTId AND a.WLId = b.WLId
				WHERE 
					b.AZGSId = v_AZGSId
				GROUP BY  CONCAT(a.DDId, '-', a.GTId)
			) a
			LEFT JOIN 
				DD b
			ON a.DDId = b.id
			WHERE b.status = '_DDStatus.YSP_'
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.DDId = d.DDId
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.DDId, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'WL' type, '补货' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				WLBH a 
			JOIN
				WL b
			ON
				a.WLId = b.id
			WHERE
				YJZXTime IS NOT NULL AND a.AZGSId = v_AZGSId
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
		
		UNION
		
		SELECT
			max(a.YJZXTime) DDorBHKey, max(a.YJZXTime) name, max(a.GTId) GTId, max(b.name) GT_name, max(b.code) GT_code, max(b.PPId) PPId, max(c.name) PP_name, 'DP' type, '上市' as task,
			GROUP_CONCAT(d.EWM) EWM, GROUP_CONCAT(e.code) KDDCode
		FROM (
			SELECT
				concat(YJZXTime, '-', GTId) AS YJZXTimeGT,
				max(YJZXTime) AS YJZXTime,
				max(GTId) AS GTId
			FROM
				DPBH a 
			JOIN
				DP b
			ON
				a.DPId = b.id
			WHERE
				YJZXTime IS NOT NULL AND a.AZGSId = v_AZGSId
			GROUP BY
				concat(YJZXTime, '-', GTId)
		) a
		JOIN 
			GT b
		ON 
			a.GTId = b.id	
		JOIN 
			PP c
		ON 
			b.PPId = c.id
		JOIN
			KDX d
		ON 
			a.YJZXTime = d.YJZXTime
		LEFT JOIN
			KDD e
		ON 
			d.KDDId = e.id
		GROUP BY concat(a.YJZXTime, '-', a.GTId)
	) a
	WHERE
		name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword OR EWM LIKE v_keyword OR KDDCode LIKE v_keyword;
    
END; 

DROP PROCEDURE IF EXISTS countDDGTByGYS; 
CREATE PROCEDURE countDDGTByGYS(IN v_GYSId INT, IN v_type CHAR(255) CHARACTER SET utf8, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	SELECT
		count(*) total
	FROM (
		SELECT 
			a.DDId,
			a.GTId,
			a.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'WL' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_GT_WLSnapshot a
			JOIN
				DD_GT_WL b
			ON 
				a.DDId = b.DDId AND a.GTId = b.GTId AND a.WLId = b.WLId
			WHERE 
				b.GYSId = v_GYSId
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
		
		UNION
		
		SELECT 
			a.DDId,
			a.GTId,
			b.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'DP' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_DW_DPSnapshot a
			JOIN
				DD_DW_DP b
			ON 
				a.DDId = b.DDId AND a.DWId = b.DWId AND a.DPId = b.DPId
			WHERE 
				b.GYSId = v_GYSId
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
	) a
	WHERE
		(DD_name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword) AND (type REGEXP v_type);
    
END; 

DROP PROCEDURE IF EXISTS queryDDGTByGYS; 
CREATE PROCEDURE queryDDGTByGYS(IN v_GYSId INT, IN v_curPage INT, IN v_perPage INT, IN v_type CHAR(255) CHARACTER SET utf8, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	declare v_offset int default 0;

	SET v_offset = v_curPage * v_perPage;

	SELECT
		*
	FROM (
		SELECT 
			a.DDId,
			a.GTId,
			a.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'WL' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_GT_WLSnapshot a
			JOIN
				DD_GT_WL b
			ON 
				a.DDId = b.DDId AND a.GTId = b.GTId AND a.WLId = b.WLId
			WHERE 
				b.GYSId = v_GYSId
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
		
		UNION
		
		SELECT 
			a.DDId,
			a.GTId,
			b.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'DP' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_DW_DPSnapshot a
			JOIN
				DD_DW_DP b
			ON 
				a.DDId = b.DDId AND a.DWId = b.DWId AND a.DPId = b.DPId
			WHERE 
				b.GYSId = v_GYSId
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
	) a
	WHERE
		(DD_name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword) AND (type REGEXP v_type)
	LIMIT v_perPage
	OFFSET v_offset;
    
END; 


DROP PROCEDURE IF EXISTS countDDGTByPPJL; 
CREATE PROCEDURE countDDGTByPPJL(IN v_UserId INT, IN v_type CHAR(255) CHARACTER SET utf8, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	SELECT
		count(*) total
	FROM (
		SELECT 
			a.DDId,
			a.GTId,
			a.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'WL' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_GT_WLSnapshot a
			WHERE 
				a.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
		
		UNION
		
		SELECT 
			a.DDId,
			a.GTId,
			b.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'DP' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_DW_DPSnapshot a
			WHERE 
				a.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
	) a
	WHERE
		(DD_name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword) AND (type REGEXP v_type);
    
END; 

DROP PROCEDURE IF EXISTS queryDDGTByPPJL; 
CREATE PROCEDURE queryDDGTByPPJL(IN v_UserId INT, IN v_curPage INT, IN v_perPage INT, IN v_type CHAR(255) CHARACTER SET utf8, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	declare v_offset int default 0;

	SET v_offset = v_curPage * v_perPage;

	SELECT
		*
	FROM (
		SELECT 
			a.DDId,
			a.GTId,
			a.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'WL' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_GT_WLSnapshot a
			WHERE 
				a.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
		
		UNION
		
		SELECT 
			a.DDId,
			a.GTId,
			b.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'DP' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_DW_DPSnapshot a
			WHERE 
				a.PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = v_UserId)
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
	) a
	WHERE
		(DD_name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword) AND (type REGEXP v_type)
	LIMIT v_perPage
	OFFSET v_offset;
    
END; 


DROP PROCEDURE IF EXISTS countDDGTByKFJL; 
CREATE PROCEDURE countDDGTByKFJL(IN v_UserId INT, IN v_type CHAR(255) CHARACTER SET utf8, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	SELECT
		count(*) total
	FROM (
		SELECT 
			a.DDId,
			a.GTId,
			a.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'WL' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_GT_WLSnapshot a
			WHERE 
				a.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
		
		UNION
		
		SELECT 
			a.DDId,
			a.GTId,
			b.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'DP' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_DW_DPSnapshot a
			WHERE 
				a.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
	) a
	WHERE
		(DD_name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword) AND (type REGEXP v_type);
    
END; 

DROP PROCEDURE IF EXISTS queryDDGTByKFJL; 
CREATE PROCEDURE queryDDGTByKFJL(IN v_UserId INT, IN v_curPage INT, IN v_perPage INT, IN v_type CHAR(255) CHARACTER SET utf8, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	declare v_offset int default 0;

	SET v_offset = v_curPage * v_perPage;

	SELECT
		*
	FROM (
		SELECT 
			a.DDId,
			a.GTId,
			a.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'WL' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_GT_WLSnapshot a
			WHERE 
				a.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
		
		UNION
		
		SELECT 
			a.DDId,
			a.GTId,
			b.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'DP' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_DW_DPSnapshot a
			WHERE 
				a.PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = v_UserId)
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
	) a
	WHERE
		(DD_name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword) AND (type REGEXP v_type)
	LIMIT v_perPage
	OFFSET v_offset;
    
END; 


DROP PROCEDURE IF EXISTS countDDGT; 
CREATE PROCEDURE countDDGT(IN v_UserId INT, IN v_type CHAR(255) CHARACTER SET utf8, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	SELECT
		count(*) total
	FROM (
		SELECT 
			a.DDId,
			a.GTId,
			a.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'WL' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_GT_WLSnapshot a
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
		
		UNION
		
		SELECT 
			a.DDId,
			a.GTId,
			b.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'DP' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_DW_DPSnapshot a
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
	) a
	WHERE
		(DD_name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword) AND (type REGEXP v_type);
    
END; 

DROP PROCEDURE IF EXISTS queryDDGT; 
CREATE PROCEDURE queryDDGT(IN v_UserId INT, IN v_curPage INT, IN v_perPage INT, IN v_type CHAR(255) CHARACTER SET utf8, IN v_keyword CHAR(255) CHARACTER SET utf8)
BEGIN

	declare v_offset int default 0;

	SET v_offset = v_curPage * v_perPage;

	SELECT
		*
	FROM (
		SELECT 
			a.DDId,
			a.GTId,
			a.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'WL' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_GT_WLSnapshot a
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
		
		UNION
		
		SELECT 
			a.DDId,
			a.GTId,
			b.PPId,
			b.name GT_name,
			b.code GT_code,
			c.name DD_name,
			d.name PP_name,
			'DP' type
		FROM (
			SELECT CONCAT(a.DDId, '-', a.GTId) as DDGT, max(a.DDId) DDId, max(a.GTId) GTId, max(a.PPId) PPId
			FROM
				DD_DW_DPSnapshot a
			GROUP BY  CONCAT(a.DDId, '-', a.GTId)
		) a
		LEFT JOIN 
			GT b
		ON 
			a.GTId = b.id
		LEFT JOIN 
			DD c
		ON 
			a.DDId = c.id
		LEFT JOIN 
			PP d
		ON 
			a.PPId = d.id
		WHERE 
			c.status = '_DDStatus.YSP_'
	) a
	WHERE
		(DD_name LIKE v_keyword OR GT_name LIKE v_keyword OR GT_code LIKE v_keyword OR PP_name LIKE v_keyword) AND (type REGEXP v_type)
	LIMIT v_perPage
	OFFSET v_offset;
    
END; 