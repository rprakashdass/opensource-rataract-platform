-- AlterTable: Convert PaymentRequest.amount from DOUBLE PRECISION (Float) to DECIMAL(10,2)
ALTER TABLE "PaymentRequest" ALTER COLUMN "amount" TYPE DECIMAL(10,2) USING "amount"::DECIMAL(10,2);

-- AlterTable: Convert Event.fundsRaised from DOUBLE PRECISION (Float) to DECIMAL(10,2)
ALTER TABLE "Event" ALTER COLUMN "fundsRaised" TYPE DECIMAL(10,2) USING "fundsRaised"::DECIMAL(10,2);
