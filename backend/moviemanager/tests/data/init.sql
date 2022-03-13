PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE actors (
	id INTEGER NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (name)
);
INSERT INTO actors VALUES(1,'Christian Bale');
INSERT INTO actors VALUES(2,'Robin Williams');
INSERT INTO actors VALUES(3,'James Earl Jones');
INSERT INTO actors VALUES(4,'Ian McKellen');
INSERT INTO actors VALUES(5,'Elijah Wood');
INSERT INTO actors VALUES(6,'Tom Hanks');
INSERT INTO actors VALUES(7,'Tim Allen');
INSERT INTO actors VALUES(8,'Patrick Stewart');
INSERT INTO actors VALUES(9,'Hugh Jackman');
INSERT INTO actors VALUES(10,'Mark Hamil');
INSERT INTO actors VALUES(11,'Carrie Fisher');
INSERT INTO actors VALUES(12,'Harrison Ford');
INSERT INTO actors VALUES(13,'Viggo Mortensen');
INSERT INTO actors VALUES(14,'Orlando Bloom');
CREATE TABLE categories (
	id INTEGER NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (name)
);
INSERT INTO categories VALUES(1,'action');
INSERT INTO categories VALUES(2,'comic');
INSERT INTO categories VALUES(3,'fantasy');
INSERT INTO categories VALUES(4,'sci-fi');
INSERT INTO categories VALUES(5,'animated');
INSERT INTO categories VALUES(6,'family');
CREATE TABLE series (
	id INTEGER NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	sort_name VARCHAR(255) NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (name), 
	UNIQUE (sort_name)
);
INSERT INTO series VALUES(1,'Lord of the Rings','lord of the rings');
INSERT INTO series VALUES(2,'X-Men','xmen');
INSERT INTO series VALUES(3,'Star Wars','star wars');
INSERT INTO series VALUES(4,'Dark Knight Trilogy','dark knight trilogy');
CREATE TABLE studios (
	id INTEGER NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	sort_name VARCHAR(255) NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (name), 
	UNIQUE (sort_name)
);
INSERT INTO studios VALUES(1,'Disney','disney');
INSERT INTO studios VALUES(2,'Fox','fox');
INSERT INTO studios VALUES(3,'Warner Brothers','warner brothers');
INSERT INTO studios VALUES(4,'Universal','universal');
INSERT INTO studios VALUES(5,'New Line Cinema','new line cinema');
CREATE TABLE movies (
	id INTEGER NOT NULL, 
	filename VARCHAR(255) NOT NULL, 
	name VARCHAR(255), 
	sort_name VARCHAR(255), 
	series_id INTEGER, 
	series_number INTEGER, 
	studio_id INTEGER, 
	processed BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (filename), 
	FOREIGN KEY(series_id) REFERENCES series (id), 
	FOREIGN KEY(studio_id) REFERENCES studios (id)
);
INSERT INTO movies VALUES(1,'[Disney] Aladdin (Robin Williams).mp4','Aladdin','aladdin',NULL,NULL,1,1);
INSERT INTO movies VALUES(2,'[Warner Brothers] {Dark Knight Trilogy 1} Batman Begins (Christian Bale).mp4','Batman Begins','batman begins',4,1,3,1);
INSERT INTO movies VALUES(4,'[Warner Brothers] {Dark Knight Trilogy 2} The Dark Knight.mp4','The Dark Knight','dark knight',4,2,3,1);
INSERT INTO movies VALUES(5,'[Disney] The Lion King.mp4','The Lion King','lion king',NULL,NULL,1,1);
INSERT INTO movies VALUES(6,'[New Line Cinema] {Lord of the Rings 1} The Fellowship of the Rings (Elijah Wood, Ian McKellen, Orlando Bloom, Viggo Mortensen).mp4','The Fellowship of the Rings','fellowship of the rings',1,1,5,1);
INSERT INTO movies VALUES(7,'[New Line Cinema] {Lord of the Rings 2} The Two Towers (Elijah Wood, Ian McKellen, Orlando Bloom, Viggo Mortensen).mp4','The Two Towers','two towers',1,2,5,1);
INSERT INTO movies VALUES(8,'[New Line Cinema] {Lord of the Rings 3} The Return of the King (Elijah Wood, Ian McKellen, Orlando Bloom, Viggo Mortensen).mp4','The Return of the King','return of the king',1,3,5,1);
INSERT INTO movies VALUES(9,'[Disney] Toy Story (Tim Allen, Tom Hanks).mp4','Toy Story','toy story',NULL,NULL,1,1);
INSERT INTO movies VALUES(10,'[Fox] {X-Men 1} X-Men (Hugh Jackman, Ian McKellen, Patrick Stewart).mp4','X-Men','xmen',2,1,2,1);
INSERT INTO movies VALUES(11,'[Fox] {X-Men 2} X2 X-Men United (Hugh Jackman, Ian McKellen, Patrick Stewart).mp4','X2 X-Men United','x2 xmen united',2,2,2,1);
INSERT INTO movies VALUES(12,'[Disney] {Star Wars 4} A New Hope (Carrie Fisher, Harrison Ford, James Earl Jones, Mark Hamil).mp4','A New Hope','new hope',3,4,1,1);
CREATE TABLE movie_actors (
	movie_id INTEGER NOT NULL, 
	actor_id INTEGER NOT NULL, 
	PRIMARY KEY (movie_id, actor_id), 
	FOREIGN KEY(movie_id) REFERENCES movies (id), 
	FOREIGN KEY(actor_id) REFERENCES actors (id)
);
INSERT INTO movie_actors VALUES(1,2);
INSERT INTO movie_actors VALUES(2,1);
INSERT INTO movie_actors VALUES(6,4);
INSERT INTO movie_actors VALUES(6,5);
INSERT INTO movie_actors VALUES(7,5);
INSERT INTO movie_actors VALUES(7,4);
INSERT INTO movie_actors VALUES(8,4);
INSERT INTO movie_actors VALUES(8,5);
INSERT INTO movie_actors VALUES(8,14);
INSERT INTO movie_actors VALUES(8,13);
INSERT INTO movie_actors VALUES(7,13);
INSERT INTO movie_actors VALUES(7,14);
INSERT INTO movie_actors VALUES(6,13);
INSERT INTO movie_actors VALUES(6,14);
INSERT INTO movie_actors VALUES(9,7);
INSERT INTO movie_actors VALUES(9,6);
INSERT INTO movie_actors VALUES(10,4);
INSERT INTO movie_actors VALUES(10,9);
INSERT INTO movie_actors VALUES(10,8);
INSERT INTO movie_actors VALUES(11,8);
INSERT INTO movie_actors VALUES(11,4);
INSERT INTO movie_actors VALUES(11,9);
INSERT INTO movie_actors VALUES(12,11);
INSERT INTO movie_actors VALUES(12,12);
INSERT INTO movie_actors VALUES(12,10);
INSERT INTO movie_actors VALUES(12,3);
CREATE TABLE movie_categories (
	movie_id INTEGER NOT NULL, 
	category_id INTEGER NOT NULL, 
	PRIMARY KEY (movie_id, category_id), 
	FOREIGN KEY(movie_id) REFERENCES movies (id), 
	FOREIGN KEY(category_id) REFERENCES categories (id)
);
INSERT INTO movie_categories VALUES(5,5);
INSERT INTO movie_categories VALUES(5,6);
INSERT INTO movie_categories VALUES(2,1);
INSERT INTO movie_categories VALUES(2,2);
INSERT INTO movie_categories VALUES(4,1);
INSERT INTO movie_categories VALUES(4,2);
INSERT INTO movie_categories VALUES(1,5);
INSERT INTO movie_categories VALUES(1,6);
INSERT INTO movie_categories VALUES(6,3);
INSERT INTO movie_categories VALUES(7,3);
INSERT INTO movie_categories VALUES(8,3);
INSERT INTO movie_categories VALUES(9,6);
INSERT INTO movie_categories VALUES(9,5);
INSERT INTO movie_categories VALUES(10,1);
INSERT INTO movie_categories VALUES(10,2);
INSERT INTO movie_categories VALUES(11,1);
INSERT INTO movie_categories VALUES(11,2);
INSERT INTO movie_categories VALUES(12,4);
INSERT INTO movie_categories VALUES(12,3);
INSERT INTO movie_categories VALUES(12,1);
COMMIT;
