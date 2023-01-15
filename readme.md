# Appointment-app

In order to run the application:

* run the [create-script](users_and_appointments.sql) first.
* adapt the db-parameters in [database-setup](model/db.js)

To start the app:

~~~
$ npm start
~~~

## Some samples

Some samples (not all) from within my IPython-console:


* Posting a user:

~~~python
In [150]: requests.post("http://localhost:3000/user", {"name":"Bart", "mail":"bart.vat@bar
     ...: t.com"}).json()
Out[150]: {'name': 'Bart', 'mail': 'bart.vat@bart.com'}
~~~


* Getting user:

~~~python
In [143]: requests.get("http://localhost:3000/user/").json()
Out[143]: 
[{'id': 3, 'name': 'Bart', 'mail': 'bart.vat@bart.com'},
 {'id': 4, 'name': 'Bart', 'mail': 'jan.jan.com'}]

In [144]: 
~~~

* Mail-validation at post:

~~~python
In [144]: requests.post("http://localhost:3000/user", {"name":"Bart", "mail":"bart.vatbart
     ...: .com"}).json()
Out[144]: {'error': 'bart.vatbart.com is not a mail'}
~~~

* Posting a new apointment:

~~~python
In [103]: requests.post("http://localhost:3000/user/3/appointment", {'start': '2023-01-01 
     ...: 01:00:00',
     ...:  'end': '2023-01-01 01:05:00',
     ...:  'location': 'BXL'}
     ...:  ).json()
Out[103]: 
{'start': '2023-01-01 01:00:00',
 'end': '2023-01-01 01:05:00',
 'location': 'BXL'}
~~~

* Validation of non-numeric id's:

~~~python
In [135]: requests.delete("http://localhost:3000/user/p20").json()
Out[135]: {'error': 'userid p20 not a number'}
In [136]: requests.delete("http://localhost:3000/user/p20").status_code
Out[137]: 400

~~~

* Checking whether start is before the end :

~~~python
In [134]: requests.post("http://localhost:3000/user/3/appointment", {'start': '2024-01-01 
     ...: 01:00:00',
     ...:  'end': '2023-01-01 01:05:00',
     ...:  'location': 'BXL'}
     ...:  ).json()
Out[134]: {'error': '2023-01-01 01:05:00 should be after 2024-01-01 01:00:00'}
In [135]: requests.post("http://localhost:3000/user/3/appointment", {'start': '2024-01-01 
     ...: 01:00:00',
     ...:  'end': '2023-01-01 01:05:00',
     ...:  'location': 'BXL'}
     ...:  ).status_code
Out[135]: 400

~~~