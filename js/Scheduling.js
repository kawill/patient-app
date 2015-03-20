;
(function(exports) {
    "use strict";

    Parse.SchedulingRouter = Parse.Router.extend({

        initialize: function() {
            console.log("initialized");

            this.model = new Parse.Session();
            // this.object = new Parse.Session();
            this.homeView = new Parse.HomeView({
                model: this.object
            });
            this.apptRequestView = new Parse.ApptRequestView({
                collection: this.collection
            });
            this.scheduleView = new Parse.ScheduleView();
            this.notesView = new Parse.NotesView();
            this.loginView = new Parse.LoginView();
            this.patientHomeView = new Parse.PatientHomeView({
                // collection: this.collection
                // collection: Parse.AppointmentCollection
            });
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
        apptrequest: function() {
            this.apptRequestView.render();
        },
        schedule: function() {
            this.scheduleView.render();
        },
        notes: function() {
            this.notesView.render();
        },
        login: function() {
            this.loginView.render();
        },
        patienthome: function() {
            var query = new Parse.Query(Parse.Appointment);
            query.equalTo("user", this.user);
            // Parse.AppointmentCollection.query = query;
            // Parse.AppointmentCollection.fetch();
            // this.collection.query = query;
            // this.collection.fetch();
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
            // date: new Date("Jan 1 1970"),
            date: new Date(1970, 0, 0),
            description: "",
            notes: "",
            user: null,
            occurred: false
        },
        initialize: function() {
            this.on("change", function() {
                this.save();
            })
        }
    })

    Parse.AppointmentCollection = Parse.Collection.extend({
        model: Parse.Appointment
    })

    Parse.ApptRequestView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "bootstrap-apptrequest",
        events: {
            // submit the form sendrequest from bootstrap-apptrequest.html
            // change add the textarea info of that form to appointments in the PatientHomeView
            "submit .sendrequest": "showappt"
        },
        showappt: function(event) {
            event.preventDefault();
            console.log(event);

            console.log(this.el.querySelector(".sendrequest input[name='apptdate']").value);
            // HTML gives date as a string ie 2015-03-25 to JS
            var dateString = this.el.querySelector(".sendrequest input[name='apptdate']").value;
            // split the string into an array of strings that removes and splits at the dash
            var dateArrayStrings = dateString.split("-");
            // will give ["2015", "03", "25"]
            console.log(dateArrayStrings);

            var dateArrayNumbers = dateArrayStrings.map(function(numberString, index){
                console.log(parseInt(numberString));
                // parseInt() converts string to number
                // line 110 prints each string ["2015", "03", "25"] as a number: 2015 3 25
                var num;
                index === 0 ? num = parseInt(numberString) : num = parseInt(numberString) - 1
                // if the index
                return num
            })

            console.log(dateArrayNumbers)

            var loggedInUser = Parse.User.current();
            var acl = new Parse.ACL(loggedInUser);
            var appointment = new Parse.Appointment({
                    date:  new Date(dateArrayNumbers[0], dateArrayNumbers[1], dateArrayNumbers[2]) ,
                    description: this.el.querySelector(".sendrequest textarea[name='concerns']").value
                });


            console.log(appointment);
            appointment.setACL(acl);
            appointment.save().then(function(data){
                console.log(data);
                console.log('save successful');
            });

        }

        //     event.findModelWithID = function(id) {
        //         var appt = new Parse.Appointment({
        //             id: id
        //         })
        //         appt.fetch().then(function() {
        //             console.log(appt)
        //         })
        //     }

        //     event.pullData = function() {
        //             var appointments = new Parse.AppointmentCollection();
        //             appointments.fetch().then(function() {
        //                 console.log(appointments)
        //             })
        //         }
        // var data = {
        //     description: this.el.querySelector('textarea').value,
        //     user: Parse.User.current()
        //     // id: id
        // }
        // var appointment = new Parse.Appointment(data);
        // var acl = new Parse.ACL(Parse.User.current());
        // var self = this;
        // appointment.setACL(acl);
        // appointment.save().then(function() {
        //     alert("appointment request submitted");
        //     self.collection.fetch()
        // });
        // console.log(data);
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
        login: function(event) {
            event.preventDefault();
            var data = {
                username: this.el.querySelector(".patientLogin input[name='email']").value,
                password: this.el.querySelector(".patientLogin input[name='password']").value
            }
            var result = Parse.User.logIn(data.username, data.password); //documentation logIn vs login
            result.then(function() {
                window.location.hash = "#dashboard"
            })
        },
        register: function(event) {
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
            result.then(function(user) {
                window.location.hash = "#dashboard"
            })
        }
    })

    Parse.PatientHomeView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "bootstrap-patient-home"

    })

    Parse.HomeView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "bootstrap-home"
    })

    // window.testData = function(){
    //     var loggedInUser = Parse.User.current()
    //     var testAppointment = new Parse.Appointment({
    //         date: new Date("March 27, 2015 9:00:00"),
    //         description: "upper respiratory..."
    //     })
    //     var acl = new Parse.ACL(loggedInUser);
    //     testAppointment.setACL(acl);
    //     testAppointment.save();
    // }

    // window.findModelWithID = function(id){
    //     var appt = new Parse.Appointment({id: id})
    //     appt.fetch().then(function(){
    //         console.log(appt)
    //     })
    // }

    // window.testPullingData = function(){
    //     var appointments = new Parse.AppointmentCollection();
    //     appointments.fetch().then(function(){
    //         console.log(appointments)
    //     })
    // }

})(typeof module === "object" ? module.exports : window)
