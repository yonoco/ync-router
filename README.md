opiniated router for koa

Planned advantages (means not everything is done yet):

1. very simple but explicit router definition file (route.ync); explicit means you have to define the ctrl function arguments here as well, not only at ctrl definition
    ```
    GET    /hello/:param1  ctrl.hello(param1)
    POST   /world/:a/:b    ctrl.world(a,b)
    GET    /               ctrl.index()
    ```
2. ctrl definition strictly checked on startup: the signatures (even the variable names) must be identical to the ones which are defined in the route.ync file