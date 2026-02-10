# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 4 |
| Low | 2 |
| Informational | 5 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Low | Warning |  | ZAP errors logged - see the zap.log file for details | 1    |
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 2    |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of responses with status code 2xx | 43 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of responses with status code 3xx | 22 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of responses with status code 5xx | 33 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with content type text/html | 100 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with method GET | 100 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Count of total endpoints | 16    |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of slow responses | 100 % |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| CSP: Failure to Define Directive with No Fallback | Medium | 1 |
| CSP: Wildcard Directive | Medium | 1 |
| CSP: script-src unsafe-inline | Medium | 1 |
| CSP: style-src unsafe-inline | Medium | 1 |
| A Server Error response code was returned by the server | Low | 7 |
| Unexpected Content-Type was returned | Low | 17 |
| Non-Storable Content | Informational | 1 |
| Sec-Fetch-Dest Header is Missing | Informational | 1 |
| Sec-Fetch-Mode Header is Missing | Informational | 1 |
| Sec-Fetch-Site Header is Missing | Informational | 1 |
| Sec-Fetch-User Header is Missing | Informational | 1 |




## Alert Detail



### [ CSP: Failure to Define Directive with No Fallback ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

The Content Security Policy fails to define one of the directives that has no fallback. Missing/excluding them is the same as allowing anything.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `The directive(s): frame-ancestors, form-action is/are among the directives that do not fallback to default-src.`


Instances: 1

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ CSP: Wildcard Directive ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
connect-src`


Instances: 1

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ CSP: script-src unsafe-inline ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `script-src includes unsafe-inline.`


Instances: 1

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ CSP: style-src unsafe-inline ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `style-src includes unsafe-inline.`


Instances: 1

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ A Server Error response code was returned by the server ](https://www.zaproxy.org/docs/alerts/100000/)



##### Low (High)

### Description

A response code of 502 was returned by the server.
This may indicate that the application is failing to handle unexpected input correctly.
Raised by the 'Alert on HTTP Response Code Error' script

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `502`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/1771142278627504972
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/1771142278627504972`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `502`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `502`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `502`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/918042092198762738
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/918042092198762738`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `502`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `502`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `502`
  * Other Info: ``


Instances: 7

### Solution



### Reference



#### CWE Id: [ 388 ](https://cwe.mitre.org/data/definitions/388.html)


#### WASC Id: 20

#### Source ID: 4

### [ Unexpected Content-Type was returned ](https://www.zaproxy.org/docs/alerts/100001/)



##### Low (High)

### Description

A Content-Type of text/html was returned by the server.
This is not one of the types expected to be returned by an API.
Raised by the 'Alert on Unexpected Content Types' script

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/2346611291141085376
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/2346611291141085376`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/4119355439556515005
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/4119355439556515005`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/actuator/health
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/actuator/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/computeMetadata/v1/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/computeMetadata/v1/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/latest/meta-data/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/latest/meta-data/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/metadata/instance
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/metadata/instance`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/opc/v1/instance/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/opc/v1/instance/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/1771142278627504972
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/1771142278627504972`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/918042092198762738
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/918042092198762738`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``


Instances: 17

### Solution



### Reference




#### Source ID: 4

### [ Non-Storable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are not storable by caching components such as proxy servers. If the response does not contain sensitive, personal or user-specific information, it may benefit from being stored and cached, to improve performance.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `502`
  * Other Info: ``


Instances: 1

### Solution

The content may be marked as storable by ensuring that the following conditions are satisfied:
The request method must be understood by the cache and defined as being cacheable ("GET", "HEAD", and "POST" are currently defined as cacheable)
The response status code must be understood by the cache (one of the 1XX, 2XX, 3XX, 4XX, or 5XX response classes are generally understood)
The "no-store" cache directive must not appear in the request or response header fields
For caching by "shared" caches such as "proxy" caches, the "private" response directive must not appear in the response
For caching by "shared" caches such as "proxy" caches, the "Authorization" header field must not appear in the request, unless the response explicitly allows it (using one of the "must-revalidate", "public", or "s-maxage" Cache-Control response directives)
In addition to the conditions above, at least one of the following conditions must also be satisfied by the response:
It must contain an "Expires" header field
It must contain a "max-age" response directive
For "shared" caches such as "proxy" caches, it must contain a "s-maxage" response directive
It must contain a "Cache Control Extension" that allows it to be cached
It must have a status code that is defined as cacheable by default (200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501).

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3

### [ Sec-Fetch-Dest Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies how and where the data would be used. For instance, if the value is audio, then the requested resource must be audio data and not any other type of resource.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 1

### Solution

Ensure that Sec-Fetch-Dest header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Dest ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Dest)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-Mode Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Allows to differentiate between requests for navigating between HTML pages and requests for loading resources like images, audio etc.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 1

### Solution

Ensure that Sec-Fetch-Mode header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Mode ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Mode)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-Site Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies the relationship between request initiator's origin and target's origin.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 1

### Solution

Ensure that Sec-Fetch-Site header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-User Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies if a navigation request was initiated by a user.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 1

### Solution

Ensure that Sec-Fetch-User header is included in user initiated requests.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-User ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-User)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3


