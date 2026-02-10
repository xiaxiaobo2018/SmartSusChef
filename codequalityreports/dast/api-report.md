# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 3 |
| Low | 7 |
| Informational | 9 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 2    |
| Low | Exceeded High | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of responses with status code 4xx | 84 % |
| Low | Exceeded High | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of slow responses | 100 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of responses with status code 2xx | 5 % |
| Info | Exceeded Low | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of responses with status code 5xx | 9 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with content type application/json | 6 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with content type application/problem+json | 23 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with content type text/csv | 1 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with content type text/html | 20 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with method DELETE | 1 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with method GET | 61 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with method POST | 33 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with method PUT | 2 % |
| Info | Informational | http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Count of total endpoints | 574    |
| Info | Informational | https://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Percentage of endpoints with method POST | 100 % |
| Info | Informational | https://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com | Count of total endpoints | 1    |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| CSP: script-src unsafe-inline | Medium | 4 |
| CSP: style-src unsafe-inline | Medium | 4 |
| HTTP Only Site | Medium | 1 |
| A Server Error response code was returned by the server | Low | 10 |
| Application Error Disclosure | Low | 5 |
| Cross Site Scripting Weakness (Persistent in JSON Response) | Low | 1 |
| Insufficient Site Isolation Against Spectre Vulnerability | Low | Systemic |
| Timestamp Disclosure - Unix | Low | 4 |
| Unexpected Content-Type was returned | Low | 132 |
| X-Content-Type-Options Header Missing | Low | Systemic |
| A Client Error response code was returned by the server | Informational | 450 |
| Authentication Request Identified | Informational | 2 |
| Modern Web Application | Informational | 4 |
| Non-Storable Content | Informational | Systemic |
| Sec-Fetch-Dest Header is Missing | Informational | 4 |
| Sec-Fetch-Mode Header is Missing | Informational | 4 |
| Sec-Fetch-Site Header is Missing | Informational | 4 |
| Sec-Fetch-User Header is Missing | Informational | 4 |
| User Agent Fuzzer | Informational | Systemic |




## Alert Detail



### [ CSP: script-src unsafe-inline ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; form-action 'self';`
  * Other Info: `script-src includes unsafe-inline.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; form-action 'self';`
  * Other Info: `script-src includes unsafe-inline.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; form-action 'self';`
  * Other Info: `script-src includes unsafe-inline.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; form-action 'self';`
  * Other Info: `script-src includes unsafe-inline.`


Instances: 4

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

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; form-action 'self';`
  * Other Info: `style-src includes unsafe-inline.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; form-action 'self';`
  * Other Info: `style-src includes unsafe-inline.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; form-action 'self';`
  * Other Info: `style-src includes unsafe-inline.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; form-action 'self';`
  * Other Info: `style-src includes unsafe-inline.`


Instances: 4

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

### [ HTTP Only Site ](https://www.zaproxy.org/docs/alerts/10106/)



##### Medium (Medium)

### Description

The site is only served under HTTP and not HTTPS.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `https://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `Failed to connect.
ZAP attempted to connect via: https://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password`


Instances: 1

### Solution

Configure your web or application server to use SSL (https).

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html ](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
* [ https://letsencrypt.org/ ](https://letsencrypt.org/)


#### CWE Id: [ 311 ](https://cwe.mitre.org/data/definitions/311.html)


#### WASC Id: 4

#### Source ID: 1

### [ A Server Error response code was returned by the server ](https://www.zaproxy.org/docs/alerts/100000/)



##### Low (High)

### Description

A response code of 500 was returned by the server.
This may indicate that the application is failing to handle unexpected input correctly.
Raised by the 'Alert on HTTP Response Code Error' script

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients ()({name,unit,carbonFootprint})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/ ()({name,unit,carbonFootprint})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales ()({date,recipeId,quantity})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ ()({date,recipeId,quantity})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import ()({salesData:[{date,recipeId,quantity}]})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name ()({salesData:[{date,dishName,quantity}],dateFormat})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name/ ()({salesData:[{date,dishName,quantity}],dateFormat})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import/ ()({salesData:[{date,recipeId,quantity}]})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage ()({date,ingredientId,recipeId,quantity})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/ ()({date,ingredientId,recipeId,quantity})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``


Instances: 10

### Solution



### Reference



#### CWE Id: [ 388 ](https://cwe.mitre.org/data/definitions/388.html)


#### WASC Id: 20

#### Source ID: 4

### [ Application Error Disclosure ](https://www.zaproxy.org/docs/alerts/90022/)



##### Low (Medium)

### Description

This page contains an error/warning message that may disclose sensitive information like the location of the file that produced the unhandled exception. This information can be used to launch further attacks against the web application. The alert could be a false positive if the error message is found inside a documentation page.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients ()({name,unit,carbonFootprint})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `HTTP/1.1 500 Internal Server Error`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales ()({date,recipeId,quantity})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `HTTP/1.1 500 Internal Server Error`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import ()({salesData:[{date,recipeId,quantity}]})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `HTTP/1.1 500 Internal Server Error`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name ()({salesData:[{date,dishName,quantity}],dateFormat})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `HTTP/1.1 500 Internal Server Error`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage ()({date,ingredientId,recipeId,quantity})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `HTTP/1.1 500 Internal Server Error`
  * Other Info: ``


Instances: 5

### Solution

Review the source code of this page. Implement custom error pages. Consider implementing a mechanism to provide a unique error reference/identifier to the client (browser) while logging the details on the server side and not exposing them to the user.

### Reference



#### CWE Id: [ 550 ](https://cwe.mitre.org/data/definitions/550.html)


#### WASC Id: 13

#### Source ID: 3

### [ Cross Site Scripting Weakness (Persistent in JSON Response) ](https://www.zaproxy.org/docs/alerts/40014/)



##### Low (Low)

### Description

A XSS attack was found in a JSON response, this might leave content consumers vulnerable to attack if they don't appropriately handle the data (response).

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes`
  * Method: `GET`
  * Parameter: `dishName`
  * Attack: `<script>alert(1);</script>`
  * Evidence: ``
  * Other Info: `Raised with LOW confidence as the Content-Type is not HTML.`


Instances: 1

### Solution

Phase: Architecture and Design
Use a vetted library or framework that does not allow this weakness to occur or provides constructs that make this weakness easier to avoid.
Examples of libraries and frameworks that make it easier to generate properly encoded output include Microsoft's Anti-XSS library, the OWASP ESAPI Encoding module, and Apache Wicket.

Phases: Implementation; Architecture and Design
Understand the context in which your data will be used and the encoding that will be expected. This is especially important when transmitting data between different components, or when generating outputs that can contain multiple encodings at the same time, such as web pages or multi-part mail messages. Study all expected communication protocols and data representations to determine the required encoding strategies.
For any data that will be output to another web page, especially any data that was received from external inputs, use the appropriate encoding on all non-alphanumeric characters.
Consult the XSS Prevention Cheat Sheet for more details on the types of encoding and escaping that are needed.

Phase: Architecture and Design
For any security checks that are performed on the client side, ensure that these checks are duplicated on the server side, in order to avoid CWE-602. Attackers can bypass the client-side checks by modifying values after the checks have been performed, or by changing the client to remove the client-side checks entirely. Then, these modified values would be submitted to the server.

If available, use structured mechanisms that automatically enforce the separation between data and code. These mechanisms may be able to provide the relevant quoting, encoding, and validation automatically, instead of relying on the developer to provide this capability at every point where output is generated.

Phase: Implementation
For every web page that is generated, use and specify a character encoding such as ISO-8859-1 or UTF-8. When an encoding is not specified, the web browser may choose a different encoding by guessing which encoding is actually being used by the web page. This can cause the web browser to treat certain sequences as special, opening up the client to subtle XSS attacks. See CWE-116 for more mitigations related to encoding/escaping.

To help mitigate XSS attacks against the user's session cookie, set the session cookie to be HttpOnly. In browsers that support the HttpOnly feature (such as more recent versions of Internet Explorer and Firefox), this attribute can prevent the user's session cookie from being accessible to malicious client-side scripts that use document.cookie. This is not a complete solution, since HttpOnly is not supported by all browsers. More importantly, XMLHTTPRequest and other powerful browser technologies provide read access to HTTP headers, including the Set-Cookie header in which the HttpOnly flag is set.

Assume all input is malicious. Use an "accept known good" input validation strategy, i.e., use an allow list of acceptable inputs that strictly conform to specifications. Reject any input that does not strictly conform to specifications, or transform it into something that does. Do not rely exclusively on looking for malicious or malformed inputs (i.e., do not rely on a deny list). However, deny lists can be useful for detecting potential attacks or determining which inputs are so malformed that they should be rejected outright.

When performing input validation, consider all potentially relevant properties, including length, type of input, the full range of acceptable values, missing or extra inputs, syntax, consistency across related fields, and conformance to business rules. As an example of business rule logic, "boat" may be syntactically valid because it only contains alphanumeric characters, but it is not valid if you are expecting colors such as "red" or "blue."

Ensure that you perform input validation at well-defined interfaces within the application. This will help protect the application even if a component is reused or moved elsewhere.
	

### Reference


* [ https://owasp.org/www-community/attacks/xss/ ](https://owasp.org/www-community/attacks/xss/)
* [ https://cwe.mitre.org/data/definitions/79.html ](https://cwe.mitre.org/data/definitions/79.html)


#### CWE Id: [ 79 ](https://cwe.mitre.org/data/definitions/79.html)


#### WASC Id: 8

#### Source ID: 1

### [ Insufficient Site Isolation Against Spectre Vulnerability ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Resource-Policy header is an opt-in header designed to counter side-channels attacks like Spectre. Resource should be specifically set as shareable amongst different origins.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/summary
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/summary`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile ()({name,email})`
  * Method: `PUT`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that the application/web server sets the Cross-Origin-Resource-Policy header appropriately, and that it sets the Cross-Origin-Resource-Policy header to 'same-origin' for all web pages.
'same-site' is considered as less secured and should be avoided.
If resources must be shared, set the header to 'cross-origin'.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Resource-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-resource-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Timestamp Disclosure - Unix ](https://www.zaproxy.org/docs/alerts/10096/)



##### Low (Low)

### Description

A timestamp was disclosed by the application/web server. - Unix

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/status
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/status`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1460032405`
  * Other Info: `1460032405, which evaluates to: 2016-04-07 12:33:25.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1460032405`
  * Other Info: `1460032405, which evaluates to: 2016-04-07 12:33:25.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict%3Fdays=7
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict (days)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1460032405`
  * Other Info: `1460032405, which evaluates to: 2016-04-07 12:33:25.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/train
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/train`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1460032405`
  * Other Info: `1460032405, which evaluates to: 2016-04-07 12:33:25.`


Instances: 4

### Solution

Manually confirm that the timestamp data is not sensitive, and that the data cannot be aggregated to disclose exploitable patterns.

### Reference


* [ https://cwe.mitre.org/data/definitions/200.html ](https://cwe.mitre.org/data/definitions/200.html)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ Unexpected Content-Type was returned ](https://www.zaproxy.org/docs/alerts/100001/)



##### Low (High)

### Description

A Content-Type of text/csv was returned by the server.
This is not one of the types expected to be returned by an API.
Raised by the 'Alert on Unexpected Content Types' script

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com%3Faaa=bbb
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com (aaa)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com (class.module.classLoader.DefaultAssertio...)`
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
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/ (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.DS_Store
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.DS_Store`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/._darcs
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/._darcs`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.bzr
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.bzr`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.git/config
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.git/config`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.hg
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.hg`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.idea/WebServers.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.idea/WebServers.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.php_cs.cache
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.php_cs.cache`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.ssh/id_dsa
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.ssh/id_dsa`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.ssh/id_rsa
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.ssh/id_rsa`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.svn/entries
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.svn/entries`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.svn/wc.db
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.svn/wc.db`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.zap4529581304860730883
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/.zap4529581304860730883`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/4398369289124242424
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/4398369289124242424`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/8020258839540920538
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/8020258839540920538`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/BitKeeper
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/BitKeeper`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/CHANGELOG.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/CHANGELOG.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/CVS/root
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/CVS/root`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/DEADJOE
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/DEADJOE`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/FileZilla.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/FileZilla.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/2402264914442576419
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/2402264914442576419`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/6017140120004932547
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/6017140120004932547`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WEB-INF/applicationContext.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WEB-INF/applicationContext.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WEB-INF/classes/1/0.class
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WEB-INF/classes/1/0.class`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WEB-INF/classes/BHs396N5/css.class
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WEB-INF/classes/BHs396N5/css.class`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WEB-INF/classes/V/js.class
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WEB-INF/classes/V/js.class`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WEB-INF/web.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WEB-INF/web.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WS_FTP.INI
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WS_FTP.INI`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WS_FTP.ini
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WS_FTP.ini`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WinSCP.ini
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/WinSCP.ini`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/_framework/blazor.boot.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/_framework/blazor.boot.json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/_wpeprivate/config.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/_wpeprivate/config.json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/adminer.php
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/adminer.php`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api%3F-s
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api (-s)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api-docs
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api-docs ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv%3F=
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/csv`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv%3F-s
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv (-s)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/csv`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv%3Fdays=7&class.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv (class.module.classLoader.DefaultAssertio...,days)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/csv`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv%3Fdays=7
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv (days)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/csv`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/csv`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/csv
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/csv`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/csv`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/csv/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/csv/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/csv`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/pdf
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/pdf`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `application/pdf`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/pdf/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/pdf/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `application/pdf`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/csv
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/csv`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/csv`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/csv/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/csv/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/csv`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/app/etc/local.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/app/etc/local.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/assets/index-BHs396N5.css
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/assets/index-BHs396N5.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/css`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/assets/index-BorlWs-V.js
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/assets/index-BorlWs-V.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `application/javascript`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/composer.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/composer.json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/composer.lock
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/composer.lock`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/config/database.yml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/config/database.yml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/config/databases.yml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/config/databases.yml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/core
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/core`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/docs/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/docs/ ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/elmah.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/elmah.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/favicon.ico
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/favicon.ico`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/filezilla.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/filezilla.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/i.php
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/i.php`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/id_dsa
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/id_dsa`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/id_rsa
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/id_rsa`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/info.php
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/info.php`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/key.pem
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/key.pem`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/lfm.php
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/lfm.php`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/myserver.key
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/myserver.key`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/openapi.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/openapi.json ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/openapi.yaml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/openapi.yaml ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/phpinfo.php
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/phpinfo.php`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/privatekey.key
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/privatekey.key`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/server-info
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/server-info`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/server-status
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/server-status`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/server.key
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/server.key`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sftp-config.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sftp-config.json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemanager.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sitemanager.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sites/default/files/.ht.sqlite
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sites/default/files/.ht.sqlite`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sites/default/private/files/backup_migrate/scheduled/test.txt
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/sites/default/private/files/backup_migrate/scheduled/test.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/test.php
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/test.php`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/v2/api-docs
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/v2/api-docs ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/v3/api-docs
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/v3/api-docs ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/vb_test.php
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/vb_test.php`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/vim_settings.xml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/vim_settings.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/winscp.ini
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/winscp.ini`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/ws_ftp.ini
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/ws_ftp.ini`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/zap2573447528843971133
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/zap2573447528843971133`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/ (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/ (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/computeMetadata/v1/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/computeMetadata/v1/ ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/latest/meta-data/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/latest/meta-data/ ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/metadata/instance
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/metadata/instance ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/opc/v1/instance/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/opc/v1/instance/ ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `text/html`
  * Other Info: ``


Instances: 132

### Solution



### Reference




#### Source ID: 4

### [ X-Content-Type-Options Header Missing ](https://www.zaproxy.org/docs/alerts/10021/)



##### Low (Medium)

### Description

The Anti-MIME-Sniffing header X-Content-Type-Options was not set to 'nosniff'. This allows older versions of Internet Explorer and Chrome to perform MIME-sniffing on the response body, potentially causing the response body to be interpreted and displayed as a content type other than the declared content type. Current (early 2014) and legacy versions of Firefox will use the declared content type (if one is set), rather than performing MIME-sniffing.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/me
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/me`
  * Method: `GET`
  * Parameter: `x-content-type-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required`
  * Method: `GET`
  * Parameter: `x-content-type-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: `x-content-type-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: `x-content-type-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile ()({name,email})`
  * Method: `PUT`
  * Parameter: `x-content-type-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`

Instances: Systemic


### Solution

Ensure that the application/web server sets the Content-Type header appropriately, and that it sets the X-Content-Type-Options header to 'nosniff' for all web pages.
If possible, ensure that the end user uses a standards-compliant and modern web browser that does not perform MIME-sniffing at all, or that can be directed by the web application/web server to not perform MIME-sniffing.

### Reference


* [ https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/gg622941(v=vs.85) ](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/gg622941(v=vs.85))
* [ https://owasp.org/www-community/Security_Headers ](https://owasp.org/www-community/Security_Headers)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ A Client Error response code was returned by the server ](https://www.zaproxy.org/docs/alerts/100000/)



##### Informational (High)

### Description

A response code of 400 was returned by the server.
This may indicate that the application is failing to handle unexpected input correctly.
Raised by the 'Alert on HTTP Response Code Error' script

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id/`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id/`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id/`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id/`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id/`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com%3Faaa=bbb
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com (aaa)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/ (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/ (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/6151104682637722512
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/6151104682637722512`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/6896956158515668844
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/6896956158515668844`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/actuator/health
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/actuator/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password%3F-s
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password (-s)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password (class.module.classLoader.DefaultAssertio...)({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login ()({username,password})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login (class.module.classLoader.DefaultAssertio...)({username,password})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password ()({currentPassword,newPassword})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile ()({name,email})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile%3F-s
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile (-s)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile (class.module.classLoader.DefaultAssertio...)({name,email})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register ()({username,password,name,email})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/568249256044720385
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/568249256044720385`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/9076038383563566469
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/9076038383563566469`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/3334323671996737218
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/3334323671996737218`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv%3Fdays=c%253A%252FWindows%252Fsystem.ini
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv (days)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/6266328850057041680
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/6266328850057041680`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/csv%3FstartDate=startDate&endDate=endDate
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/csv (endDate,startDate)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/pdf%3FstartDate=startDate&endDate=endDate
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/pdf (endDate,startDate)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/3960296669893752850
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/3960296669893752850`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/csv%3FstartDate=startDate&endDate=endDate
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/csv (endDate,startDate)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast%3Fdays=c%253A%252FWindows%252Fsystem.ini&includePastDays=0
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast (days,includePastDays)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/3432209465524077195
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/3432209465524077195`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar%3FstartDate=startDate&endDate=endDate
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar (endDate,startDate)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/1793634252023137640
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/1793634252023137640`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/date
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/date`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/date%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/date (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/date/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/date/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/10
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/10`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/10%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/10 (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/10/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/10/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/2931088228962680119
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/2931088228962680119`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/summary%3Fdays=c%253A%252FWindows%252Fsystem.ini&includePastDays=0
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/summary (days,includePastDays)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/4886980178225319786
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/4886980178225319786`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/5720183190797511590
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/5720183190797511590`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id ()({name,unit,carbonFootprint})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/8867511603972586967
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/8867511603972586967`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict%3F-s
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict (-s)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict%3Fdays=7&class.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict (class.module.classLoader.DefaultAssertio...,days)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict%3Fdays=7
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict (days)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/train
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/train`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/train%3F-s
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/train (-s)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/train%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/train (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/train%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/train (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/439776910250924285
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/439776910250924285`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id ()({name,isSellable,isSubRecipe,ingredients:[{ingredientId,childRecipeId,quantity}]})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales%3FstartDate=startDate&endDate=endDate
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales (endDate,startDate)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/8486143103144525480
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/8486143103144525480`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id ()({quantity})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import ()({salesData:[{date,recipeId,quantity}]})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import%3Faaa=bbb
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import (aaa)({salesData:[{date,recipeId,quantity}]})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import (class.module.classLoader.DefaultAssertio...)({salesData:[{date,recipeId,quantity}]})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name ()({salesData:[{date,dishName,quantity}],dateFormat})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name%3Faaa=bbb
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name (aaa)({salesData:[{date,dishName,quantity}],dateFormat})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name (class.module.classLoader.DefaultAssertio...)({salesData:[{date,dishName,quantity}],dateFormat})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/6380631507831611259
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/6380631507831611259`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/date
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/date`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/date%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/date (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/date/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/date/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/1461161577799589300
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/1461161577799589300`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/date
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/date`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/date%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/date (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/date/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/date/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/trend%3FstartDate=startDate&endDate=endDate
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/trend (endDate,startDate)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/6189980259433409484
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/6189980259433409484`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup ()({companyName,uen,storeName,outletLocation,contactNumber,openingDate,latitude,longitude,countryCode,address,isActive})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/7223263761568210000
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/7223263761568210000`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id ()({username,password,name,email,role,status})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage%3FstartDate=startDate&endDate=endDate
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage (endDate,startDate)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/4300860790354127217
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/4300860790354127217`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id ()({date,ingredientId,recipeId,quantity})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/trend%3FstartDate=startDate&endDate=endDate
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/trend (endDate,startDate)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger-ui/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger-ui/ ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger-ui/index.html
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger-ui/index.html ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger.json ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger.yaml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger.yaml ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/7040970041225320266
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/7040970041225320266`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/ui/index.html
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/ui/index.html ()({emailOrUsername})`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1%3Fclass.module.classLoader.DefaultAssertionStatus=nonsense
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1 (class.module.classLoader.DefaultAssertio...)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1%3Fname=abc
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1 (name)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/.env
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/.env`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/.htaccess
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/.htaccess`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/5608912105983866585
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/5608912105983866585`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/trace.axd
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/trace.axd`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/ (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/ (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()(------eb7119a5-71d5-44ba-ba7e-3cf45091ad14
Content-Disposition: form-data; name="1"

{}
------eb7119a5-71d5-44ba-ba7e-3cf45091ad14
Content-Disposition: form-data; name="0"

["$1:a:a"]
------eb7119a5-71d5-44ba-ba7e-3cf45091ad14--
)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login ()({username,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login/ ()({username,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/me
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/me ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/me%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/me (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/me%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/me (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register ()({username,password,name,email})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register ()({username,password,name,email})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `409`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register/ ()({username,password,name,email})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/summary
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/summary ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/summary%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/summary (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/summary%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Dashboard/summary (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv%3Fdays=7
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/forecast/csv (days)(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/csv%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/csv (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/csv%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/csv (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/pdf%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/pdf (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/pdf%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/sales/pdf (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/csv%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/csv (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/csv%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Export/wastage/csv (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast%3Fdays=7&includePastDays=0
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast (days,includePastDays)(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/date%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/date (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/date%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/calendar/date (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/10%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/10 (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/10%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/holidays/10 (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/summary%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/summary (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/summary%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/summary (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/summary%3Fdays=7&includePastDays=0
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/summary (days,includePastDays)(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/tomorrow
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/tomorrow ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/tomorrow%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/tomorrow (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/tomorrow%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/tomorrow (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/weather
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/weather ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/weather%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/weather (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/weather%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Forecast/weather (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/detailed
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/detailed ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/detailed%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/detailed (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/detailed%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/detailed (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/live
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/live ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/live%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/live (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/live%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/live (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/ready
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/ready ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/ready%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/ready (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/ready%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Health/ready (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients ()({name,unit,carbonFootprint})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict%3Fdays=c%253A%252FWindows%252Fsystem.ini
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/predict (days)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/status
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/status ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/status%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/status (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/status%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ml/status (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes ()({name,isSellable,isSubRecipe,ingredients:[{ingredientId,childRecipeId,quantity}]})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes ()({name,isSellable,isSubRecipe,ingredients:[{ingredientId,childRecipeId,quantity}]})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `409`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/ ()({name,isSellable,isSubRecipe,ingredients:[{ingredientId,childRecipeId,quantity}]})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `409`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales ()({date,recipeId,quantity})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import ()({salesData:[{date,recipeId,quantity}]})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name ()({salesData:[{date,dishName,quantity}],dateFormat})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/import-by-name (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/date%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/date (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/date%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/ingredients/date (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/date%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/date (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/date%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/recipes/date (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/trend%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/trend (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/trend%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/trend (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup ()({companyName,uen,storeName,outletLocation,contactNumber,openingDate,latitude,longitude,countryCode,address,isActive})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/setup/ ()({companyName,uen,storeName,outletLocation,contactNumber,openingDate,latitude,longitude,countryCode,address,isActive})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/status
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/status ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/status%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/status (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/status%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/status (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users ()({username,password,name,email,role})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users ()({username,password,name,email,role})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `409`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/ ()({username,password,name,email,role})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage ()({date,ingredientId,recipeId,quantity})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `415`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/trend%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/trend (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/trend%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/trend (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/computeMetadata/v1/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/computeMetadata/v1/ ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/latest/meta-data/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/latest/meta-data/ ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/metadata/instance
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/metadata/instance ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/opc/v1/instance/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/opc/v1/instance/ ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `405`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1 ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1 (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1 (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json ()(class.module.classLoader.DefaultAssertio...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('cmd.exe /C echo hk91mydhg4py...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json%3F-d+allow_url_include%253d1+-d+auto_prepend_file%253dphp://input
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json (-d allow_url_include=1 -d auto_prepend_f...)(<?php exec('echo hk91mydhg4py8t7xwf23',$...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password ()({currentPassword,newPassword})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password/ ()({currentPassword,newPassword})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile ()({name,email})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id ()({name,unit,carbonFootprint})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id/ ()({name,unit,carbonFootprint})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id ()({name,isSellable,isSubRecipe,ingredients:[{ingredientId,childRecipeId,quantity}]})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Recipes/id/ ()({name,isSellable,isSubRecipe,ingredients:[{ingredientId,childRecipeId,quantity}]})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id ()({quantity})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Sales/id/ ()({quantity})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store ()({companyName,uen,storeName,outletLocation,contactNumber,openingDate,latitude,longitude,countryCode,address,isActive})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Store/ ()({companyName,uen,storeName,outletLocation,contactNumber,openingDate,latitude,longitude,countryCode,address,isActive})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id ()({username,password,name,email,role,status})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users/id/ ()({username,password,name,email,role,status})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id ()({date,ingredientId,recipeId,quantity})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id/
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Wastage/id/ ()({date,ingredientId,recipeId,quantity})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``


Instances: 450

### Solution



### Reference



#### CWE Id: [ 388 ](https://cwe.mitre.org/data/definitions/388.html)


#### WASC Id: 20

#### Source ID: 4

### [ Authentication Request Identified ](https://www.zaproxy.org/docs/alerts/10111/)



##### Informational (High)

### Description

The given request has been identified as an authentication request. The 'Other Info' field contains a set of key=value lines which identify any relevant fields. If the request is in a context which has an Authentication Method set to "Auto-Detect" then this rule will change the authentication to match the request identified.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Users ()({username,password,name,email,role})`
  * Method: `POST`
  * Parameter: `email`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `userParam=email
userValue=zaproxy@example.com
passwordParam=password`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login ()({username,password})`
  * Method: `POST`
  * Parameter: `username`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `userParam=username
userValue=John Doe
passwordParam=password`


Instances: 2

### Solution

This is an informational alert rather than a vulnerability and so there is nothing to fix.

### Reference


* [ https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/ ](https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/)



#### Source ID: 3

### [ Modern Web Application ](https://www.zaproxy.org/docs/alerts/10109/)



##### Informational (Medium)

### Description

The application appears to be a modern web application. If you need to explore it automatically then the Ajax Spider may well be more effective than the standard one.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script type="module" crossorigin src="/assets/index-BorlWs-V.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/detailed`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script type="module" crossorigin src="/assets/index-BorlWs-V.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/live`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script type="module" crossorigin src="/assets/index-BorlWs-V.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/Health/ready`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script type="module" crossorigin src="/assets/index-BorlWs-V.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`


Instances: 4

### Solution

This is an informational alert and so no changes are required.

### Reference




#### Source ID: 3

### [ Non-Storable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are not storable by caching components such as proxy servers. If the response does not contain sensitive, personal or user-specific information, it may benefit from being stored and cached, to improve performance.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/store-setup-required`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/swagger/v1/swagger.json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login ()({username,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register ()({username,password,name,email})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `authorization:`
  * Other Info: ``

Instances: Systemic


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
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login ()({username,password})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register ()({username,password,name,email})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 4

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
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login ()({username,password})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register ()({username,password,name,email})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 4

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
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login ()({username,password})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register ()({username,password,name,email})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 4

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
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/forgot-password ()({emailOrUsername})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/login ()({username,password})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register ()({username,password,name,email})`
  * Method: `POST`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 4

### Solution

Ensure that Sec-Fetch-User header is included in user initiated requests.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-User ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-User)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ User Agent Fuzzer ](https://www.zaproxy.org/docs/alerts/10104/)



##### Informational (Medium)

### Description

Check for differences in response based on fuzzed User Agent (eg. mobile sites, access as a Search Engine Crawler). Compares the response statuscode and the hashcode of the response body with the original response.

* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id`
  * Method: `DELETE`
  * Parameter: `Header User-Agent`
  * Attack: `Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)`
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/register ()({username,password,name,email})`
  * Method: `POST`
  * Parameter: `Header User-Agent`
  * Attack: `Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)`
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/password ()({currentPassword,newPassword})`
  * Method: `PUT`
  * Parameter: `Header User-Agent`
  * Attack: `Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)`
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Auth/profile ()({name,email})`
  * Method: `PUT`
  * Parameter: `Header User-Agent`
  * Attack: `Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)`
  * Evidence: ``
  * Other Info: ``
* URL: http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id
  * Node Name: `http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/Ingredients/id ()({name,unit,carbonFootprint})`
  * Method: `PUT`
  * Parameter: `Header User-Agent`
  * Attack: `Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)`
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution



### Reference


* [ https://owasp.org/wstg ](https://owasp.org/wstg)



#### Source ID: 1


