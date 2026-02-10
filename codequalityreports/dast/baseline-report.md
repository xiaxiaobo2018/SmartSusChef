# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 4 |
| Low | 1 |
| Informational | 7 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 2    |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of responses with status code 2xx | 100 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with content type application/javascript | 16 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with content type text/css | 16 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with content type text/html | 66 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with method GET | 100 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Count of total endpoints | 6    |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of slow responses | 100 % |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| CSP: Failure to Define Directive with No Fallback | Medium | 1 |
| CSP: Wildcard Directive | Medium | 3 |
| CSP: script-src unsafe-inline | Medium | 3 |
| CSP: style-src unsafe-inline | Medium | 3 |
| Insufficient Site Isolation Against Spectre Vulnerability | Low | 5 |
| Information Disclosure - Suspicious Comments | Informational | 1 |
| Modern Web Application | Informational | 5 |
| Sec-Fetch-Dest Header is Missing | Informational | 3 |
| Sec-Fetch-Mode Header is Missing | Informational | 3 |
| Sec-Fetch-Site Header is Missing | Informational | 3 |
| Sec-Fetch-User Header is Missing | Informational | 3 |
| Storable and Cacheable Content | Informational | Systemic |




## Alert Detail



### [ CSP: Failure to Define Directive with No Fallback ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

The Content Security Policy fails to define one of the directives that has no fallback. Missing/excluding them is the same as allowing anything.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt`
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

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
connect-src`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
connect-src`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
connect-src`


Instances: 3

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

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `script-src includes unsafe-inline.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `script-src includes unsafe-inline.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `script-src includes unsafe-inline.`


Instances: 3

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

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `style-src includes unsafe-inline.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `style-src includes unsafe-inline.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https:;`
  * Other Info: `style-src includes unsafe-inline.`


Instances: 3

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

### [ Insufficient Site Isolation Against Spectre Vulnerability ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Embedder-Policy header is a response header that prevents a document from loading any cross-origin resources that don't explicitly grant the document permission (using CORP or CORS).

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/favicon.ico
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/favicon.ico`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 5

### Solution

Ensure that the application/web server sets the Cross-Origin-Embedder-Policy header appropriately, and that it sets the Cross-Origin-Embedder-Policy header to 'require-corp' for documents.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Embedder-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-embedder-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Information Disclosure - Suspicious Comments ](https://www.zaproxy.org/docs/alerts/10027/)



##### Informational (Low)

### Description

The response appears to contain suspicious comments which may help an attacker.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/assets/index-CDL483OP.js
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/assets/index-CDL483OP.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `select`
  * Other Info: `The following pattern was used: \bSELECT\b and was detected in likely comment: "//www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}funct", see evidence field for the suspicious comment/snippet.`


Instances: 1

### Solution

Remove all comments that return information that may help an attacker and fix any underlying problems they refer to.

### Reference



#### CWE Id: [ 615 ](https://cwe.mitre.org/data/definitions/615.html)


#### WASC Id: 13

#### Source ID: 3

### [ Modern Web Application ](https://www.zaproxy.org/docs/alerts/10109/)



##### Informational (Medium)

### Description

The application appears to be a modern web application. If you need to explore it automatically then the Ajax Spider may well be more effective than the standard one.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script type="module" crossorigin src="/assets/index-CDL483OP.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script type="module" crossorigin src="/assets/index-CDL483OP.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/favicon.ico
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/favicon.ico`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script type="module" crossorigin src="/assets/index-CDL483OP.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script type="module" crossorigin src="/assets/index-CDL483OP.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script type="module" crossorigin src="/assets/index-CDL483OP.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`


Instances: 5

### Solution

This is an informational alert and so no changes are required.

### Reference




#### Source ID: 3

### [ Sec-Fetch-Dest Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies how and where the data would be used. For instance, if the value is audio, then the requested resource must be audio data and not any other type of resource.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

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

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

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

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

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

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt`
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml`
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

### Solution

Ensure that Sec-Fetch-User header is included in user initiated requests.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-User ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-User)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Storable and Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, and may be retrieved directly from the cache, rather than from the origin server by the caching servers, in response to similar requests from other users. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where "shared" caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/assets/index-BHs396N5.css
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/assets/index-BHs396N5.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/assets/index-CDL483OP.js
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/assets/index-CDL483OP.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`

Instances: Systemic


### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3


