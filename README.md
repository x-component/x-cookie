# x-cookie

[Build Status](https://travis-ci.org/x-component/x-cookie.png?v1.0.0)](https://travis-ci.org/x-component/x-cookie)

- [./cookie.js](#cookiejs) 

# ./cookie.js

  - [extend](#extend)

## extend

  Cookie as defined here http://www.ietf.org/rfc/rfc2109.txt
  We use cookie.Domain, cookie.Path cookie['Max-Age'] so the original names !
  values may not contain ; , or ' '
  only these characters must be url encoded or the value must be put in double quotes "
  all chars should be only US-ASCII or encoded otherwise
  (this does NOT mean that chars like ? & etc must be encoded (as some implementations do..) )
