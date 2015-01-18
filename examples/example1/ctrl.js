module.exports = {

    index: function*() {
        console.log("index called");
    },

    hello: function*() {
        console.log("hello called");
        console.log(this);
    },

    world: function*() {
        console.log("world called");
    }

}