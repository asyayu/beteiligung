CREATE TABLE visitors (
	id INT PRIMARY KEY AUTO_INCREMENT,
	age INT,
	stadtbezirk VARCHAR(50),
	kanal JSON,
	beteiligung JSON,
	erreichen_in_zukunft JSON,
	beteiligungsformat JSON,
	analog_digital JSON,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);