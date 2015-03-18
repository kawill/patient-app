;
(function(exports){
    "use strict";

    Parse.SchedulingRouter = Parse.Router.extend({

        initialize: function(){
            console.log("initialized");

            this.model = new Parse.Session();
            // this.object = new Parse.Session();
            this.homeView = new Parse.HomeView ({
                model: this.object
            });
            this.apptRequestView = new Parse.ApptRequestView();
            this.scheduleView = new Parse.ScheduleView();
            this.notesView = new Parse.NotesView();
            this.loginView = new Parse.LoginView();
            this.patientHomeView = new Parse.PatientHomeView();
            Parse.history.start();
        },
        routes: {
            "apptrequest": "apptrequest",
            "schedule": "schedule",
            "notes": "notes",
            "login": "login",
            "dashboard": "patienthome",
            "*default": "home"
        },
        apptrequest: function(){
            this.apptRequestView.render();
        },
        schedule: function(){
            this.scheduleView.render();
        },
        notes: function(){
            this.notesView.render();
        },
        login: function(){
            this.loginView.render();
        },
        patienthome: function(){
            this.patientHomeView.render();
        },
        home: function() {
            this.homeView.render();
        }
    })

    Parse.Session = Parse.Object.extend({
        className: "Session",
        defaults: {
            // "": ""
        }
    })

    Parse.Appointment = Parse.Object.extend({
        className: "appointment",
        defaults: {
            date: new Date("Jan 1 1970"),
            description: "",
            notes: "",
            user: null,
            occurred: false
        }
    })

    Parse.AppointmentCollection = Parse.Collection.extend({
        model: Parse.Appointment
    })

    Parse.ApptRequestView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "bootstrap-apptrequest"
        // events: {
        //     "submit .schedulebtn":"schedulebtn"
        // },
        // schedulebtn: function(event){
        //     var self=this;
        //     event.preventDefault();
        //     window.location.hash = "#schedule";
        //     // this.scheduleView.render();
        // }
    })

    Parse.ScheduleView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "schedule"
    })

    Parse.NotesView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "notes"
    })

    Parse.LoginView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "bootstrap-patient-login",
        events: {
            "submit .patientLogin": "login",
            "submit .patientRegister": "register"
        },
        login: function(event){
            event.preventDefault();
            var data = {
                username: this.el.querySelector(".patientLogin input[name='email']").value,
                password: this.el.querySelector(".patientLogin input[name='password']").value
            }
            var result = Parse.User.logIn(data.username, data.password); //documentation logIn vs login
            result.then(function(){
                window.location.hash = "#dashboard"
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
                window.location.hash = "#dashboard"
            })
        }
    })

    Parse.PatientHomeView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "bootstrap-patient-home",
        events: {
            "submit .scheduleappt": "scheduleappt"
        },
        scheduleappt: function(event){
            event.preventDefault();

        }
    })

    Parse.HomeView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "bootstrap-home"
    })

    window.testData = function(){
        var loggedInUser = Parse.User.current()
        var testAppointment = new Parse.Appointment({
            date: new Date("March 27, 2015 9:00:00"),
            description: "upper respiratory..."
        })
        var acl = new Parse.ACL(loggedInUser);
        testAppointment.setACL(acl);
        testAppointment.save();
    }

    window.findModelWithID = function(id){
        var appt = new Parse.Appointment({id: id})
        appt.fetch().then(function(){
            console.log(appt)
        })
    }

    window.testPullingData = function(){
        var appointments = new Parse.AppointmentCollection();
        appointments.fetch().then(function(){
            console.log(appointments)
        })
    }

})(typeof module === "object" ? module.exports : window)