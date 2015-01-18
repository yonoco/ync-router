module.exports = {

    index: function*() {
        console.log("index called");
    },

    hello: function*() {
        console.log("hello called");
        console.log(this);
    },

    world: function*(param2, param3) {
        console.log("world called");
        console.log("param2=" + param2);
        console.log("param3=" + param3);
    }

}