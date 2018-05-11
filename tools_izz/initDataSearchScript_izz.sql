
INSERT INTO User
(Id,username,password,JS, createdAt, updatedAt)
VALUES
('1','ZHY1','$2a$08$Rzkmy1il5ChV57CITysnNOXg5J0hiVa3Nd5eRsISsEz5Oz7vHe8H2','装货员', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('2','AZG1','$2a$08$B9d93pLmxgHjTUmeGsmVQuJs7/6pPgwyfyPkKNp4wHH03oJnzScZu','安装工', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('100','GTBA1','$2a$08$1ShJUrJBm.LCY9lR0THQdO.BYrxJAjsH5E1bLoa.9Xfhh6DPl5Ccm','柜台BA', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO PP
(id,name, createdAt, updatedAt)
VALUES
('1','PP1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO GT
(id,name,code,PPId,QY,GTBAUserId,CS, createdAt, updatedAt)
VALUES
('1','GT1','1','1','南区','100','上海', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO GYS
(id,Name,type, createdAt, updatedAt)
VALUES
('1','GYS1','生产', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO ZHY_GYS
(UserId,GYSId, createdAt, updatedAt)
VALUES
('1','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO AZGS
(id,name, createdAt, updatedAt)
VALUES
('1','AZGS1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO AZG_AZGS
(UserId,AZGSId, createdAt, updatedAt)
VALUES
('2','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO WL
(id,name,code,level,PPId,GYSId,imageUrl, createdAt, updatedAt)
VALUES
('1','WL1_3_1','1_3_1','3','1','1','imageUrl1_3_1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('2','WL1_3_2','1_3_2','3','1','1','imageUrl1_3_2', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('3','WL1_3_3','1_3_3','3','1','1','imageUrl1_3_3', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('4','WL1_3_4','1_3_4','3','1','1','imageUrl1_3_4', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('5','WL1_3_5','1_3_5','3','1','1','imageUrl1_3_5', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('6','WL1_3_6','1_3_6','3','1','1','imageUrl1_3_6', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO DD
(id,name,status,PPId, createdAt, updatedAt)
VALUES
('1','DD1','已审批','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO DD_GT_WL
(id,DDId,GTId,WLId,number,GYSId,status,ZXNumber, createdAt, updatedAt)
VALUES
('1','1','1','1','10','1','已分配发货供应商','0', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('2','1','1','2','2','1','已分配发货供应商','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('3','1','1','3','3','1','装箱完成','3', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO DD_GT_WL
(id,DDId,GTId,WLId,number,GYSId,status,ZXNumber,AZGSId,AZGUserId,YJAZDate, createdAt, updatedAt)
VALUES
('4','1','1','4','2','1','收货','2','1','2','2018-01-01', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('5','1','1','5','2','1','可拍全景图','2','1','2','2018-01-01', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('6','1','1','6','2','1','完成','2','1','2','2018-01-01', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO KDD
(id,code,GTId, createdAt, updatedAt)
VALUES
('1','KDD1','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('2','KDD2','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('3','KDD3','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('4','KDD4','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('101','KDD101','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('102','KDD102','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('103','KDD103','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('104','KDD104','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO KDX
(id,EWM,GTId,status,DDId,HWType,GYSId, createdAt, updatedAt)
VALUES
('1','{"type":"KDX","uuid":"KDX1"}','1','装箱','1','WL','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('101','{"type":"KDX","uuid":"KDX101"}','1','装箱','1','DP','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO KDX
(id,EWM,GTId,status,DDId,HWType,KDDId,GYSId, createdAt, updatedAt)
VALUES
('2','{"type":"KDX","uuid":"KDX2"}','1','发货','1','WL','1','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('3','{"type":"KDX","uuid":"KDX3"}','1','收箱','1','WL','2','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('102','{"type":"KDX","uuid":"KDX102"}','1','发货','1','DP','101','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('103','{"type":"KDX","uuid":"KDX103"}','1','收箱','1','DP','102','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO KDX
(id,EWM,GTId,status,DDId,HWType,YJZXTime,GYSId, createdAt, updatedAt)
VALUES
('4','{"type":"KDX","uuid":"KDX4"}','1','装箱','1','WL','2018-10-11','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('104','{"type":"KDX","uuid":"KDX104"}','1','装箱','1','DP','2018-10-11','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO KDX
(id,EWM,GTId,status,DDId,HWType,YJZXTime,KDDId,GYSId, createdAt, updatedAt)
VALUES
('5','{"type":"KDX","uuid":"KDX5"}','1','发货','1','WL','2018-10-12','3','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('6','{"type":"KDX","uuid":"KDX6"}','1','收箱','1','WL','2018-10-13','4','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('105','{"type":"KDX","uuid":"KDX105"}','1','发货','1','DP','2018-10-12','103','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('106','{"type":"KDX","uuid":"KDX106"}','1','收箱','1','DP','2018-10-13','104','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO WYWL
(id,EWM,status,WLId,GYSId, createdAt, updatedAt)
VALUES
('200','{"type":"WL","typeId":1,"uuid":"1_200"}','入库','1','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO WYWL
(id,EWM,status,WLId,GYSId,DDGTWLId,KDXId, createdAt, updatedAt)
VALUES
('1','{"type":"WL","typeId":2,"uuid":"2_1"}','装箱','2','1','2','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('2','{"type":"WL","typeId":3,"uuid":"3_1"}','装箱','3','1','3','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('3','{"type":"WL","typeId":3,"uuid":"3_2"}','发货','3','1','3','2', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('4','{"type":"WL","typeId":3,"uuid":"3_3"}','收箱','3','1','3','3', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('5','{“type”:"WL","typeId":4,"uuid":"4_1"}','收货','4','1','4','3', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('6','{“type”:"WL","typeId":4,"uuid":"4_2"}','收货','4','1','4','3', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('7','{“type”:"WL","typeId":5,"uuid":"5_1"}','反馈','5','1','5','3', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('8','{“type”:"WL","typeId":5,"uuid":"5_2"}','反馈','5','1','5','3', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO WLBH
(id,GTId,WLId,status,GYSId,ZXNumber,imageUrl,YJZXTime,AZGSId, createdAt, updatedAt)
VALUES
('1','1','1','已分配发货供应商','1','0','imagUrl','2018-10-10','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('2','1','1','装箱完成','1','1','imagUrl','2018-10-11','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('3','1','1','装箱完成','1','1','imagUrl','2018-10-12','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO WLBH
(id,GTId,WLId,status,GYSId,ZXNumber,imageUrl,YJZXTime,AZGSId,AZGUserId, createdAt, updatedAt)
VALUES
('4','1','1','收货','1','1','imagUrl','2018-10-13','1','2', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('5','1','1','收货','1','1','imagUrl','2018-10-13','1','2', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('6','1','1','完成','1','1','imagUrl','2018-10-13','1','2', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO WYWL
(id,EWM,status,WLId,GYSId,WLBHId,KDXId, createdAt, updatedAt)
VALUES
('9','{"type":"WL","typeId":1,"uuid":"1_1"}','装箱','1','1','2','4', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('10','{"type":"WL","typeId":1,"uuid":"1_2"}','发货','1','1','3','5', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('11','{"type":"WL","typeId":1,"uuid":"1_3"}','收货','1','1','4','6', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('12','{"type":"WL","typeId":1,"uuid":"1_4"}','反馈','1','1','5','6', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('13','{"type":"WL","typeId":1,"uuid":"1_5"}','完成','1','1','6','6', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO DP
(id,name,PPId,GYSId, createdAt, updatedAt)
VALUES
('1','DP1','1','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO DW
(id,name,GTId,DPId,CC,CZ, createdAt, updatedAt)
VALUES
('1','DW1','1','1','100*100','铜板', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('2','DW2','1','1','100*100','铜板', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('3','DW3','1','1','100*100','铜板', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('4','DW4','1','1','100*100','铜板', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('5','DW5','1','1','100*100','铜板', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('6','DW6','1','1','100*100','铜板', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('7','DW7','1','1','100*100','铜板', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO DD_DW_DP
(id,DDId,DWId,DPId,GYSId,status,ZXNumber,CC,CZ, createdAt, updatedAt)
VALUES
('1','1','1','1','1','已分配发货供应商','0','100*100','铜板', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('2','1','2','1','1','装箱完成','1','100*100','铜板', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('3','1','3','1','1','装箱完成','1','100*100','铜板', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('4','1','4','1','1','装箱完成','1','100*100','铜板', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO DD_DW_DP
(id,DDId,DWId,DPId,GYSId,status,ZXNumber,CC,CZ,AZGSId,AZGUserId,YJAZDate, createdAt, updatedAt)
VALUES
('5','1','5','1','1','收货','1','100*100','铜板','1','2','2018-01-01', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('6','1','6','1','1','可拍全景图','1','100*100','铜板','1','2','2018-01-01', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('7','1','7','1','1','完成','1','100*100','铜板','1','2','2018-01-01', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO WYDP
(id,EWM,status,DPId,GYSId,DDDWDPId,KDXId, createdAt, updatedAt)
VALUES
('1','{"type":"DP","typeId":1,"uuid":"1_1","DWId":1,"name":"DW1","CC":"100*100","CZ":"铜板"}','装箱','1','1','2','101', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO WYDP
(id,EWM,status,DPId,GYSId,DDDWDPId,KDXId, createdAt, updatedAt)
VALUES
('2','{"type":"DP","typeId":1,"uuid":"1_2","DWId":2,"name":"DW2","CC":"100*100","CZ":"铜板"}','发货','1','1','3','102', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('3','{"type":"DP","typeId":1,"uuid":"1_3","DWId":3,"name":"DW3","CC":"100*100","CZ":"铜板"}','收箱','1','1','4','103', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('4','{"type":"DP","typeId":1,"uuid":"1_4","DWId":4,"name":"DW4","CC":"100*100","CZ":"铜板"}','收货','1','1','5','103', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('5','{"type":"DP","typeId":1,"uuid":"1_5","DWId":5,"name":"DW5","CC":"100*100","CZ":"铜板"}','反馈','1','1','6','103', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('6','{"type":"DP","typeId":1,"uuid":"1_6","DWId":6,"name":"DW6","CC":"100*100","CZ":"铜板"}','反馈','1','1','7','103', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO DPBH
(id,DWId,DPId,status,GYSId,ZXNumber,imageUrl,CZ,CC,YJZXTime,AZGSId, createdAt, updatedAt)
VALUES
('1','1','1','已分配发货供应商','1','0','imagUrl','铜板','100*100','2018-10-10','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('2','2','1','装箱完成','1','1','imagUrl','铜板','100*100','2018-10-11','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('3','3','1','装箱完成','1','1','imagUrl','铜板','100*100','2018-10-12','1', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO DPBH
(id,DWId,DPId,status,GYSId,ZXNumber,imageUrl,CZ,CC,YJZXTime,AZGSId,AZGUserId, createdAt, updatedAt)
VALUES
('4','4','1','收货','1','1','imagUrl','铜板','100*100','2018-10-13','1','2', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('5','5','1','收货','1','1','imagUrl','铜板','100*100','2018-10-13','1','2', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('6','6','1','完成','1','1','imagUrl','铜板','100*100','2018-10-13','1','2', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');

INSERT INTO WYDP
(id,EWM,status,DPId,GYSId,DPBHId,KDXId, createdAt, updatedAt)
VALUES
('7','{"type":"DP","typeId":1,"uuid":"1_7","DWId":2,"name":"DW2","CC":"100*100","CZ":"铜板"}','装箱','1','1','2','104', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('8','{"type":"DP","typeId":1,"uuid":"1_8","DWId":3,"name":"DW3","CC":"100*100","CZ":"铜板"}','发货','1','1','3','105', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('9','{"type":"DP","typeId":1,"uuid":"1_9","DWId":4,"name":"DW4","CC":"100*100","CZ":"铜板"}','收货','1','1','4','106', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('10','{"type":"DP","typeId":1,"uuid":"1_10","DWId":5,"name":"DW5","CC":"100*100","CZ":"铜板"}','反馈','1','1','5','106', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895'),
('11','{"type":"DP","typeId":1,"uuid":"1_11","DWId":6,"name":"DW6","CC":"100*100","CZ":"铜板"}','完成','1','1','6','106', '2018-05-11 16:09:15.895', '2018-05-11 16:09:15.895');
