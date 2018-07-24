# Nightbot-Fortnite-Plugin
A nightbot fortnite plugin (commands)

## INIT

To setup this module, you need to have an account on Epic Games. After that you need to get 2 dedicated headers from Fortnite.

How to get these headers ?

*   Install & Open Fiddler 4
*   In Tools -> Options -> HTTPS, Select Capture HTTPS Connects
*   In Tools -> Options -> HTTPS, Select Decrypt HTTPS traffic
*   Start Capture (F12)
*   After that start your epic games launcher.
*   You will see a request with /account/api/oauth/token. Click on it and click after that on Inspectors get the header (Authorization header content and remove basic) => **This header is your Client Launcher Token**
*   **Press F12 to stop scan** (Fortnite stop working if you capture HTTPS requests at this moment)
*   Launch Fortnite
*   When the game tell you : "Connecting" or "Update" in waiting screen, **Press F12 to reactivate requests capture**
*   You will see again a request with /account/api/oauth/token. Click on it and click after that on Inspectors get the header (Authorization header content and remove basic) => **This header is your Fortnite Client Token**
*   Stop Capture

## NIGHTBOT EXAMPLE COMMANDS

 `!commands add !winsall -cd=15 -ul=everyone $(urlfetch https://your_domain_name/api/fortnite?username=Tekzification.Tv&type=top&group=lifetime&time=weekly&plaftform=pc&twitchn=$(touser)&q=$(query))`
 
---

###URL PARAMETERS :
- username = String
- q = String
- type = String (kd, top)
- group = String (lifetime, solo, duo, squad)
- time = String (weekly, alltime)
- platform = String (pc, ps4, xb1)
