tulio@example.com
Admin1234


https://www.youtube.com/watch?v=BzlPrVB_DwA

https://www.youtube.com/watch?v=b8fFRX0T38M

- create table and schema in PG.
- create records in it

https://www.w3schools.com/postgresql/postgresql_insert_into.php

	SET search_path TO webapi;

	CREATE TABLE cars (
	  brand VARCHAR(255),
	  model VARCHAR(255),
	  year INT
	);

	INSERT INTO cars (brand, model, year)
	VALUES ('Ford', 'Mustang', 1964);

- Recreate DB schema:

	DROP SCHEMA public CASCADE;
	CREATE SCHEMA public;
	If you are using PostgreSQL 9.3 or later, you may also need to restore the default grants.

	GRANT ALL ON SCHEMA public TO postgres;
	GRANT ALL ON SCHEMA public TO public;

- Create CRUD project and connect it to DB
- How are queries generated in Entity framework?
- data serialization and deserialization.
- DTOs and DAOs
- data validation in .NET
	fluentValidation
	https://www.youtube.com/watch?v=vaDDB7BpEgQ
- Add unit tests to everything
- pagination
- add a logger

- Use authentication
	https://www.youtube.com/watch?v=6EEltKS8AwA
	https://www.youtube.com/watch?v=Pkeu_o8k99Q&t
	https://www.youtube.com/watch?v=S0RSsHKiD6Y
	https://www.youtube.com/watch?v=8J3nuUegtL4&t
- How to choose identity password hashing secret?
- Choose refresh and access token duration?
- how services work in .NET?





useful data models:
	schema.org

When this project is done:
	- protect from overposting attacks?
	- evaluate quality of all SQL queries created by EF
	- create DB indexes for all SQL queries


Migrations:
	add-migration "migration-name"
	update-database

1. Create CRUD for books (including image upload);
	2. Add C# script to populate books
2. Add categories many-to-many. Figure out how to filter on category and use a materialized view for it.
3. Crate materialized view for efficient fuzzy text search across all fields?




How to encapsulate common HTTP logic so that it can be used in multiple controllers?
	use middleware
usermanager is one example

add breakpoint in mercado pago service and step through to see response.
Look for redirect url in "init_point"


Mercado pago:
	- Add logic to validate webhook signature - ok
	- How to show products in mercado pago pay page? -> don't think this is possible


In production, disable exceptions from being logged twice:
https://learn.microsoft.com/en-us/answers/questions/1618819/why-does-asp-net-core-log-an-unhandled-exception-w

TODO:
	- change email validation behaviour: invalidated emails can use the app, the only thing they can't do is to buy books -> Actually, this doesn't work well. You could run into a scenario where a user uses the app for a long period of time but then forgets its password. Then they can't reset the password because their account has not been validated.
	finish webhook controller
		set up testing environment with mercado pago
		How to check missing payments on mercado pago?
		mercado pago preferences don't hold an external url reference? try to list them from api
		payment links can be used again and again? How to prevent this?
	create job runner (hangfire) to synchronize payments with mercado pago
	
	use static file hosting for book images - ok
	conditional static file hosting for book files (epub) - ok
	books controller:
		filter by category, author. Filter by anything (postgres fuzzy search)
		include title, isbn, author, description and categories (tags implemented as text arrays with GIN index) in search
		https://www.databasesoup.com/2015/01/tag-all-things-part-3.html
		how to add index from migration and custom columns (auto-generated ts-vector)? Maybe add a custom SQL query to the migration file?
		TODO: add categories and tags to books model. Normalize them? Normalize Authors?
	finish auth endpoints


	use antiforgerytoken? what is it?
	replace all id searches with findasync?











