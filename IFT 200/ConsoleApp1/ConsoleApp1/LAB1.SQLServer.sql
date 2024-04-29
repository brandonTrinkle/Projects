CREATE SCHEMA ORMModel1
GO

GO


CREATE TABLE ORMModel1.Patient
(
	"nr." int CHECK ("nr." >= 0) NOT NULL,
	patientName nvarchar(30) NOT NULL,
	isSmoker bit,
	CONSTRAINT Patient_PK PRIMARY KEY("nr.")
)
GO


CREATE TABLE ORMModel1.DrugAllergy
(
	patient int CHECK (patient >= 0) NOT NULL,
	allergy nvarchar(20) NOT NULL,
	CONSTRAINT DrugAllergy_PK PRIMARY KEY(patient, allergy)
)
GO


ALTER TABLE ORMModel1.DrugAllergy ADD CONSTRAINT DrugAllergy_FK FOREIGN KEY (patient) REFERENCES ORMModel1.Patient ("nr.") ON DELETE NO ACTION ON UPDATE NO ACTION
GO


GO