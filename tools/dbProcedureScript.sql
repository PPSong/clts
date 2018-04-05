DROP PROCEDURE IF EXISTS genDD;
CREATE PROCEDURE genDD(IN v_PPId INT, IN v_name CHAR(255) CHARSET utf8, IN v_status CHAR(255) CHARSET utf8)
BEGIN
	DECLARE code CHAR(5) DEFAULT '00000';
    DECLARE msg TEXT;
	DECLARE v_DDId INT DEFAULT 0;
    DECLARE v_now DATETIME(3) DEFAULT NOW();

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      GET DIAGNOSTICS CONDITION 1
        code = RETURNED_SQLSTATE, msg = MESSAGE_TEXT;
        SELECT 
			0 result,
            CONCAT(code, ':' ,msg) msg;
    END;
    
	START TRANSACTION; 	
    
	-- 如果订单记录不存在则创建 
	SELECT id into v_DDId
    FROM
		DD a
	WHERE
		a.PPID = v_PPId
		AND
		a.name = v_name;
    
    IF v_DDId = 0 THEN
		INSERT 
        INTO
			DD
			(name, status, PPId, createdAt, updatedAt)
        VALUES
			(v_name, v_status, v_PPId, v_now, v_now); 
            
		-- 取得新插入记录id
		SET v_DDId = LAST_INSERT_ID();
    END IF;
    
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
    
    SELECT 
		1 result,
        'ok' msg;
    
    COMMIT;
END;