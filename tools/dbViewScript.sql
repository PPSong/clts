-- 柜台_一级组合
DROP VIEW IF EXISTS V_GT_YJZH ;
CREATE VIEW V_GT_YJZH
AS
(
SELECT
	a.id GTId,
    b.YJZHId,
    b.number YJZHTotal
FROM
	GT AS a
LEFT JOIN
	GT_YJZH AS b
ON
	a.id = b.GTId
);

DROP VIEW IF EXISTS V_GT_YJZH_List ;
CREATE VIEW V_GT_YJZH_List
AS
(
SELECT
	a.GTId,
    b.name GTName,
    a.YJZHId,
    c.name YJZHName,
    a.YJZHTotal
FROM
	V_GT_YJZH AS a
LEFT JOIN
	GT AS b
ON
	a.GTId = b.id
LEFT JOIN
	YJZH AS c
ON
	a.YJZHId = c.id
);
    
-- 柜台_二级组合
DROP VIEW IF EXISTS V_GT_EJZH;
CREATE VIEW V_GT_EJZH
AS
SELECT 
	aa.GTId,
    aa.EJZHId,
    sum(aa.EJZHTotal) EJZHTotal
FROM
	(
	SELECT
		a.GTId,
		b.EJZHId,
		b.number * a.YJZHTotal EJZHTotal
	FROM
		V_GT_YJZH AS a
	LEFT JOIN
		YJZH_EJZH AS b
	ON
		a.YJZHId = b.YJZHId
	) AS aa
GROUP BY
	aa.GTId,
	aa.EJZHId;
    
DROP VIEW IF EXISTS V_GT_EJZH_List ;
CREATE VIEW V_GT_EJZH_List
AS
(
SELECT
	a.GTId,
    b.name GTName,
    a.EJZHId,
    c.name EJZHName,
    a.EJZHTotal
FROM
	V_GT_EJZH AS a
LEFT JOIN
	GT AS b
ON
	a.GTId = b.id
LEFT JOIN
	EJZH AS c
ON
	a.EJZHId = c.id
);    
    
-- 柜台_一级物料
DROP VIEW IF EXISTS V_GT_YJWL;
CREATE VIEW V_GT_YJWL
AS
SELECT 
	aa.GTId,
    aa.WLId,
    sum(aa.WLIdNumber) WLTotal
FROM
	(
	SELECT
		a.GTId,
		b.WLId,
        1 * a.YJZHTotal WLIdNumber
		
	FROM
		V_GT_YJZH AS a
	LEFT JOIN
		YJZH AS b
	ON
		a.YJZHId = b.id
	) AS aa
GROUP BY
	aa.GTId,
    aa.WLId;

DROP VIEW IF EXISTS V_GT_YJWL_List;
CREATE VIEW V_GT_YJWL_List
AS
SELECT
	a.GTId,
    b.name GTName,
    a.WLId,
    c.name WLName,
	a.WLTotal
FROM
	V_GT_YJWL AS a
LEFT JOIN
	GT AS b
ON
	a.GTId = b.id
LEFT JOIN
	WL AS c
ON
	a.WLId = c.id;

-- 柜台_二级物料
DROP VIEW IF EXISTS V_GT_EJWL;
CREATE VIEW V_GT_EJWL
AS
SELECT
	aa.GTId,
    aa.WLId,
    count(aa.WLId) WLTotal
FROM
	(
	SELECT
		a.GTId,
		b.WLId
	FROM
		V_GT_EJZH AS a
	LEFT JOIN
		EJZH AS b
	ON
		a.EJZHId = b.id
	) AS aa
GROUP BY
	aa.GTId,
    aa.WLId;
    
DROP VIEW IF EXISTS V_GT_EJWL_List;
CREATE VIEW V_GT_EJWL_List
AS
SELECT
	a.GTId,
    b.name GTName,
    a.WLId,
    c.name WLName,
	a.WLTotal
FROM
	V_GT_EJWL AS a
LEFT JOIN
	GT AS b
ON
	a.GTId = b.id
LEFT JOIN
	WL AS c
ON
	a.WLId = c.id;

-- 柜台_三级物料
DROP VIEW IF EXISTS V_GT_SJWL;
CREATE VIEW V_GT_SJWL
AS
SELECT 
	aa.GTId,
    aa.WLId,
    sum(aa.WLTotal) WLTotal
FROM
	(
	SELECT
		a.GTId,
        b.WLId,
        a.EJZHTotal * b.number WLTotal
	FROM
		V_GT_EJZH AS a
	LEFT JOIN
		EJZH_SJWL AS b
	ON
		a.EJZHId = b.EJZHId
	) AS aa
GROUP BY
	aa.GTId,
    aa.WLId;

DROP VIEW IF EXISTS V_GT_SJWL_List;
CREATE VIEW V_GT_SJWL_List
AS
SELECT
	a.GTId,
    b.name GTName,
    a.WLId,
    c.name WLName,
	a.WLTotal
FROM
	V_GT_SJWL AS a
LEFT JOIN
	GT AS b
ON
	a.GTId = b.id
LEFT JOIN
	WL AS c
ON
	a.WLId = c.id;

-- 柜台_FGTester
DROP VIEW IF EXISTS V_GT_FGTester;
CREATE VIEW V_GT_FGTester
AS
SELECT 
	aa.GTId,
    aa.FGTesterId,
    sum(aa.FGTesterTotal) FGTesterTotal
FROM
	(
	SELECT
		a.GTId,
        b.FGTesterId,
        a.EJZHTotal * b.number FGTesterTotal
	FROM
		V_GT_EJZH AS a
	LEFT JOIN
		EJZH_FGTester AS b
	ON
		a.EJZHId = b.EJZHId
	) AS aa
GROUP BY
	aa.GTId,
    aa.FGTesterId;
        
        
DROP VIEW IF EXISTS V_GT_FGTester_List;
CREATE VIEW V_GT_FGTester_List
AS    
SELECT
	a.GTId,
    e.name GTName,
    c.id FGId,
    c.name FGName,
    d.id TesterId,
    d.name TesterName,
    CONCAT(c.name, '_', d.name) FGTesterName,
    a.FGTesterTotal
FROM 
	V_GT_FGTester AS a
LEFT JOIN
	FG_Tester AS b
ON
	a.FGTesterId = b.id
LEFT JOIN
	FG AS c
ON
	b.FGId = c.id
LEFT JOIN
	Tester AS d
ON
	b.TesterId = d.id
LEFT JOIN
	GT AS e
ON
	a.GTId = e.id;
    
DROP VIEW IF EXISTS V_GT_WL;
CREATE VIEW V_GT_WL
AS    
SELECT
	*
FROM
	(
	SELECT * FROM V_GT_YJWL
	UNION
	SELECT * FROM V_GT_EJWL
	UNION
	SELECT * FROM V_GT_SJWL
	) AS a
WHERE
	a.WLId IS NOT NULL
ORDER BY
	a.GTId,
    a.WLId;

DROP VIEW IF EXISTS V_GT_WL_List;
CREATE VIEW V_GT_WL_List
AS    
SELECT
	*
FROM
	(
	SELECT * FROM V_GT_YJWL_List
	UNION
	SELECT * FROM V_GT_EJWL_List
	UNION
	SELECT * FROM V_GT_SJWL_List
	) AS a
WHERE
	a.WLId IS NOT NULL
ORDER BY
	a.GTId,
    a.WLId;
    
-- 柜台_灯位_灯片
DROP VIEW IF EXISTS V_DW_DP;
CREATE VIEW V_DW_DP
AS
SELECT
    a.id DWId,
    b.id DPId
FROM
	DW a
LEFT JOIN
	DP b
ON
	a.DPId = b.id
ORDER BY
	a.id,
    b.id;
    
DROP VIEW IF EXISTS V_DW_DP_List;
CREATE VIEW V_DW_DP_List
AS
SELECT
    a.DWId,
    b.name DWName,
    a.DPId,
    c.name DPName
FROM
	V_DW_DP a
LEFT JOIN
	DW b
ON
	a.DWId = b.id
LEFT JOIN
	DP c
ON
	a.DPId = c.id;