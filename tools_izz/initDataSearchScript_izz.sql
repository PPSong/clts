
INSERT INTO User
(Id,username,password,JS, createdAt, updatedAt)
VALUES
('1','ZHY1','$2a$08$wKq.MJkM/e0eWLW00myaq.g4Zo6UO8WardJj1uYkPWn7HGlNlwR3a','装货员', '2018-05-10 18:53:57.155', '2018-05-10 18:53:57.155'),
('100','GTBA1','$2a$08$fP4J54ELYk3vjcmF3Z2kV.ohu7b7KNsIOmF85pD/mEne0WQNTiwqK','柜台BA', '2018-05-10 18:53:57.155', '2018-05-10 18:53:57.155');

INSERT INTO PP
(id,name, createdAt, updatedAt)
VALUES
('1','PP1', '2018-05-10 18:53:57.155', '2018-05-10 18:53:57.155');

INSERT INTO GT
(id,name,code,PPId,QY,GTBAUserId,CS, createdAt, updatedAt)
VALUES
('1','GT1','1','1','南区','100','上海', '2018-05-10 18:53:57.155', '2018-05-10 18:53:57.155');

INSERT INTO GYS
(id,Name,type, createdAt, updatedAt)
VALUES
('1','GYS1','生产', '2018-05-10 18:53:57.155', '2018-05-10 18:53:57.155');

INSERT INTO ZHY_GYS
(UserId,GYSId, createdAt, updatedAt)
VALUES
('1','1', '2018-05-10 18:53:57.155', '2018-05-10 18:53:57.155');

INSERT INTO WL
(id,name,code,level,PPId,GYSId,imageUrl, createdAt, updatedAt)
VALUES
('1','WL1_3_1','1_3_1','3','1','1','imageUrl1_3_1', '2018-05-10 18:53:57.155', '2018-05-10 18:53:57.155');

INSERT INTO DD
(id,name,status,PPId, createdAt, updatedAt)
VALUES
('1','DD1','已审批','1', '2018-05-10 18:53:57.155', '2018-05-10 18:53:57.155');

INSERT INTO DD_GT_WL
(id,DDId,GTId,WLId,number,GYSId,status,ZXNumber,YJRKDate,YJZXDate, createdAt, updatedAt)
VALUES
('1','1','1','1','10','1','已分配发货供应商','0','2018-2-2','2018-2-2', '2018-05-10 18:53:57.155', '2018-05-10 18:53:57.155');

INSERT INTO KDX
(id,EWM,GTId,status,DDId,HWType, createdAt, updatedAt)
VALUES
('1','{"type":"KDX","uuid":"KDX1"}','1','装箱','1','WL', '2018-05-10 18:53:57.155', '2018-05-10 18:53:57.155');
