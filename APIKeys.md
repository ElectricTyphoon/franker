Franker uses remote translation services, access is paid (free tier exists for Microsoft).<br />
Please follow instructions below to get access to either service (you need only one of them).<br />
Collected ids/keys/secrets copy to respective fields in: **Safari > Preferences... > Extensions > Franker**<br />
All your settings are stored securely locally and never transferred to 3rd parties or collected by other means.

  * **Microsoft Translator (2M chars/month free)**
> > [Get your Client ID and Client Secret](http://blogs.msdn.com/b/translation/p/gettingstarted1.aspx)
  * **Google Translate (no free plan)**
> > [Pricing info and setup billing](https://cloud.google.com/translate/v2/pricing),<br />
> > [Get your API key](https://cloud.google.com/translate/v2/using_rest#auth) (public API access, key for server applications)


---


**But why I have to setup all this?**<br />
Translation is hard. Both Microsoft and Google have many servers to support to give you users the service.
Previously, when the services were young, not stable, had not-so-good results, they there free. Now they (both Microsoft and Google) want monetise the service and that’s understandable.

Franker is a simple layer of code between translation services and the user browser, it needs access to the translation services in order to do the job.
The access costs money, developers can't and don’t want to cover these expenses for end users. The access can be configured by the end user by registering on either Microsoft or Google.
We in Franker have tried to make it as easy as possible, unfortunately we are not in power to change the registration procedures or shield users from them.

Browser extensions have no support for so-called “in-app” purchases, that could be leveraged to simplify access to the end users like you.
As of now, nobody makes money on Franker and have no plans to do that in the future.