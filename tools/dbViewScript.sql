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
    
-- 柜台_一级物料
DROP VIEW IF EXISTS V_GT_YJWL;
CREATE VIEW V_GT_YJWL
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
		V_GT_YJZH AS a
	LEFT JOIN
		YJZH AS b
	ON
		a.YJZHId = b.id
	) AS aa
GROUP BY
	aa.GTId,
    aa.WLId;

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
    
SELECT * FROM V_GT_FGTester