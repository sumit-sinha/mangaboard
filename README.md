Mangaboard
===================

Mangaboard is a mobile tool to read manga. It allows features such as
1. Browse list of manga
2. Bookmark favourite manga
3. Fast load time with background lookup and cached data
4. Mobile app with alert for new manga (In development)

Demo
--------

Trial version of this application is hosted on below URL
http://workofsumit.netne.net

Desktop browsers are supported though use your mobile device for best performance and usability.

Tech Stack and Third Party Dependencies
---------------------------------------------

This application is developed using **Angular2** with **Typescript** and **Gulp** is used to configure its compilation and build. Also **BrowserSync** is used to easily re-deploy the changes during development.

**CORS Proxy**

All the content shown in UI is fetch using ajax call to various manga hosting sites. HTML string is parsed in Javascript with help of **Regular Expression** and then it is converted into meaningful objects and list. Since CORS call is not directly supported with ajax, we are using a CORS proxy - https://cors-anywhere.herokuapp.com to help overcome this issue.

**Lory**

Lory is a touch enabled minimalistic slider written in vanilla JavaScript. More details can be found here http://meandmax.github.io/lory/. It is used to add a slider effect when navigating from page to another in a manga.

Server
----------

>To start the server use the below command from root folder
>**npm run start**
