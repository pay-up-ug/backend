### payup-backend
apis

### add user

`POST  http://localhost:8080/users/Createuser
Content-Type: application/json`

```json
{
     "contact":"0707600334", 
     "name":"khali",
     "email":"khlaif@gmail.com",
     "password":"name"
}
```

### Login
`POST  http://localhost:8080/users/login
Content-Type: application/json`

```json
{
     "email":"khlaif@gmail.com",
     "password":"name"
}
```

### generate keys
`POST  http://localhost:8080/users/generatekeys/62fc0b1cd6ce9a2d54b5366c`
`
Content-Type: application/json
x-access-token: token
`


### API mobile money
`POST  http://localhost:8080/api/playground/v1/mobilepay/payup.62ef74d68653ee35f486fe87.6c64a507-250c-4b82-a42c-d455d8a2b874`
`Content-Type: application/json`

```json
{
    "payeeName":"khalifan",
    "payeeContact":"0706081432", 
    "amount":10000, 
    "payeeInfor":{
        "email":"khli@qw.c",
        "contact":"90097565443"
    }
}
```

### API mobile tracking
`GET   http://localhost:8080/api/playground/v1/mobilepay/track/payup.62fc0b1cd6ce9a2d54b5366c.36724738-158a-4452-bdce-5267cfea00d3`
`Content-Type: application/json`

```json
{
    "internalId":"62fc0e9773829f28c48acd19"
}
```

### card payment
`POST  http://localhost:8080/api/playground/v1/cardpayment/payup.63021858e064723324a6d2aa.0b998fba-2400-46b9-b7e9-63cb08a289bd`
`Content-Type: application/json`

```json
{
    "cardNumber":"5444101010101010",
    "cardDate":"08/24", 
    "amount":10000, 
    "cardCvv":"987",
    "payeeInfor":{
        "email":"nuhu@w.c",
        "contact":"90097565443"
    }
}
```

### card payment tracking
`GET  http://localhost:8080/api/playground/v1/cardpayment/track/payup.63021858e064723324a6d2aa.3746e285-6360-4ef4-8e2b-7ca311660ab4`
`Content-Type: application/json`

```json
{
    "id":"63028fc5931cca2980ce94b4"
}
```

### link creating seller
`POST  http://localhost:8080/links/createseller`
`Content-Type: application/json`
`x-access-token: token`

```json
{
     "title":"khlaif@gmail.com",
     "description":"name",
      "ownerId":"63021858e064723324a6d2aa",
      "ownerType":"seller",
      "sellerId":"63021858e064723324a6d2aa",
      "sellerName":"khali",
      "amount":45000,
      "sellerContact":"0723578798"
}
```

## create link buyer
`POST  http://localhost:8080/links/createbuyer`
`Content-Type: application/json`
`x-access-token: token`

```json
{
     "title":"shoes and goats",
     "description":"name",
      "ownerId":"63021858e064723324a6d2aa",
      "ownerType":"buyer",
      "buyerId":"63021858e064723324a6d2aa",
      "buyerName":"khali",
      "amount":88000,
      "buyerContact":"46733123454"
}
```

### get single link
`GET  http://localhost:8080/links/6307f04d42dc0c04d4ce8ffa`
`Content-Type: application/json`
`x-access-token: token`

### get all links
`GET  http://localhost:8080/links`
`Content-Type: application/json`
`x-access-token: token`

```json
{
      "userId":"63021858e064723324a6d2aa",
}
```

### refresh cash state
`PATCH  http://localhost:8080/links/cashrefresh/6308083f917b5612d4708de8`
`Content-Type: application/json`
`x-access-token: token`

### add seller to link
`POST  http://localhost:8080/links/addseller`
`Content-Type: application/json`
`x-access-token: token`

```json
{
     "linkId":"6307f3248035ce359c1c06b4", 
     "sellerId":"6309850ec10f6906f03aa243",
     "sellerName":"raymond@gmail.com",
     "sellerContact":"0707600336"
}
```

### Add buyer
`POST  http://localhost:8080/links/addbuyer`
`Content-Type: application/json`
`x-access-token: token`

```json
{
     "linkId":"6307f04d42dc0c04d4ce8ffa", 
     "buyerId":"63021858e064723324a6d2aa",
     "buyerName":"khali",
     "buyerContact":"0707600436"
}
```

### update link
`PATCH   http://localhost:8080/links/update/6307f04d42dc0c04d4ce8ffa`
`Content-Type: application/json`
`x-access-token: token`

```json
{
     "title":"Books",
     "description":"change me"
}
```

### kill  link
`PATCH   http://localhost:8080/links/kill/6307f04d42dc0c04d4ce8ffa`
`Content-Type: application/json`
`x-access-token: token`

### delivered on link
`PUT   http://localhost:8080/links/delivered`
`Content-Type: application/json`
`x-access-token: token`

```json
{
     "linkId":"6307f04d42dc0c04d4ce8ffa",
     "userId":"6309850ec10f6906f03aa243"
}
```

### recieved link product
`PUT   http://localhost:8080/links/received`
`Content-Type: application/json`
`x-access-token: token`

```json
{
     "linkId":"6307f04d42dc0c04d4ce8ffa",
     "userId":"63021858e064723324a6d2aa"
}
```
