;
(function(exports){
    "use strict";

    Parse.SchedulingRouter = Parse.Router.extend({

        initialize: function(){
            console.log("initialized");

            this.model = new Parse.Session();
            // this.object = new Parse.Session();
            this.view = new Parse.HomeView ({
                model: this.object
            });
            this.loginView = new Parse.LoginView();
            this.patientHomeView = new Parse.PatientHomeView();
            Parse.history.start();
        },
        routes: {
            "login": "login",
            "patienthome": "patienthome",
            "*default": "home"
        },
        login: function(){
            this.loginView.render();
        },
        patienthome: function(){
            this.patientHomeView.render();
        },
        home: function() {
            this.view.render();
        }
    })

    Parse.Session = Parse.Object.extend({
        className: "Session",
        defaults: {
            // "": ""
        }
    })

    Parse.LoginView = Parse.TemplateView.extend({
        el: ".container",
        view: "patient-login",
        events: {
            "submit .patientLogin": "login",
            "submit .patientRegister": "register"
        },
        login: function(event){
            event.preventDefault();
            var data = {
                username: this.el.querySelector(".patientLogin input[name='email']").value,
                password: this.el.querySelector(".patientLogin input[password='password']").value
            }
            var result = Parse.User.login(data.username, data.password);
            result.then(function(){
                window.location.hash = "#patienthome"
            })
        },
        register: function(event){
            event.preventDefault();
            var data = {
                username: this.el.querySelector(".patientRegister input[name='email']").value,
                password: this.el.querySelector(".patientRegister input[name='password']").value,
                passwordrepeat: this.el.querySelector(".patientRegister input[name='passwordrepeat']").value
            }

            var user = new Parse.User();
            user.set('username', data.username);
            // user.set('email', data.username)
            user.set('password', data.password);

            // var result = user.registered() documentation?
            var result = user.signUp()
            result.then(function(user){
                window.location.hash = "#patienthome"
            })
        }
    })

    Parse.PatientHomeView = Parse.TemplateView.extend({
        el: ".container",
        view: "patient-home"
    })

    Parse.HomeView = Parse.TemplateView.extend({
        el: ".container",
        view: "home"
    })

})(typeof module === "object" ? module.exports : window)