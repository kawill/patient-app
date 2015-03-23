;
(function(exports) {
    "use strict";

    Parse.SchedulingRouter = Parse.Router.extend({

        initialize: function() {
            console.log("initialized");

            this.model = new Parse.Session();
            this.homeView = new Parse.HomeView({
                model: this.object
            });

            this.appointments = new Parse.AppointmentCollection();
            this.apptRequestView = new Parse.ApptRequestView({
                collection: this.appointments
            });
            this.patientHomeView = new Parse.PatientHomeView({
                collection: this.appointments
                // collection: this.collection
                // collection: Parse.AppointmentCollection
            });
            this.notes = new Parse.NotesCollection();
            // Parse.NotesCollection has model: Parse.Appointment
            this.patientNotesView = new Parse.PatientNotesView({
                collection: this.notes
            });

            this.scheduleView = new Parse.ScheduleView();
            this.notesView = new Parse.NotesView();
            this.loginView = new Parse.LoginView();

            Parse.history.start();
        },
        routes: {
            "apptrequest": "loadApptrequest",
            "schedule": "schedule",
            "notes": "notes",
            "notes/:id": "loadVistNotes",
            "login": "login",
            //"dashboard/:patientId": "loadPatientDashboard"
            "dashboard": "patienthome",
            "*default": "home"
        },
        loadApptrequest: function() {
            // var query = new Parse.Query(Parse.Appointment);
            // query.equalTo("user", this.user);
            // Parse.AppointmentCollection.query = query;
            // Parse.AppointmentCollection.fetch();
            // this.collection.query = query;
            // this.collection.fetch();
            var self = this;
            // self = router
            this.appointments.fetch().then(function(collectionResult) {
                // the result should be a Parse.Collection, hopefully
                self.apptRequestView.collection = collectionResult;
                self.apptRequestView.render();
                // self because it needs to be a part of this model, new function
            });
        },
        // loadTodaysAppointents: function(){

        //     var today = new Date();

        //     var pQuery = new Parse.Query(Parse.Appointment)
        //     pQuery.equalTo('date', today)

        //     pQuery.find().then(function(result){
        //         var todaysAppointments = result

        //         self.apptRequestView.collection = todaysAppointments;
        //         self.apptRequestView.render()


        //     });
        // },
        schedule: function() {
            this.scheduleView.render();
        },
        notes: function() {
            this.notesView.render();
        },
        loadVistNotes: function() {
            var self = this;
            // self = router
            this.appointments.fetch().then(function(collectionResult) {
                // the result should be a Parse.Collection, hopefully
                self.patientNotesView.collection = collectionResult;
                self.patientNotesView.render();
                // self because it needs to be a part of this model, new function
            });
            // this.patientNotesView.render();
        },
        login: function() {
            this.loginView.render();
        },
        patienthome: function() {
            // var query = new Parse.Query(Parse.Appointment);
            // query.equalTo("user", this.user);
            // Parse.AppointmentCollection.query = query;
            // Parse.AppointmentCollection.fetch();
            // this.collection.query = query;
            // this.collection.fetch();
            var self = this;
            // self = router
            this.appointments.fetch().then(function(collectionResult) {
                // the result should be a Parse.Collection, hopefully
                self.patientHomeView.collection = collectionResult;
                self.patientHomeView.render();
                // self because it needs to be a part of this model, new function
            });
            // this.patientHomeView.render();
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
            dateReadable: "",
            description: "",
            id: "",
            notes: "",
            doctorNotes: "",
            user: null,
            occurred: false
        },
        initialize: function() {
            this.on("change", function() {
                this.save();
            })
        }
    })

    // Parse.Note = Parse.Object.extend({
    //     className: "note",

    // })

    Parse.AppointmentCollection = Parse.Collection.extend({
        model: Parse.Appointment
    })

    Parse.NotesCollection = Parse.Collection.extend({
        model: Parse.Appointment
        // model: Parse.Note
    })

    Parse.ApptRequestView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "bootstrap-apptrequest",
        events: {
            // submit the form sendrequest from bootstrap-apptrequest.html
            // activity on the DOM
            "submit .sendrequest": "saveappt"
        },
        saveappt: function(event) {
            event.preventDefault();
            // console.log(event);
            var loggedInUser = Parse.User.current();
            var acl = new Parse.ACL(loggedInUser);
            // console.log(this.el.querySelector(".sendrequest input[name='apptdate']").value);
            // line above: HTML gives date as a string ie 2015-03-25 to JS
            var dateString = this.el.querySelector(".sendrequest input[name='apptdate']").value;

            var dateArrayStrings = dateString.split("-");
            // line above split the string into an array of strings that removes and splits at the dash
            // will convert 2015-03-25 to ["2015", "03", "25"]
            // console.log(dateArrayStrings);

            var dateArrayNumbers = dateArrayStrings.map(function(numberString, index) {
                console.log(parseInt(numberString));
                // .map convert this array (of strings) into a new array (of numbers)
                // parseInt() converts string to number
                // prints each string ["2015", "03", "25"] as a number: 2015 3 25, .map puts it in array [2015 3 25]
                var num = numberString;
                index === 0 || index === 2 ? num = parseInt(numberString) : num = parseInt(numberString) - 1;
                // if the index of the string is 0 or 2 convert that string to the number
                // if the index of the string is not 0 or 2 convert that string to a number and subtract 1
                // substract 1 because the the number representing month begins at an index of 0
                return num;
            });

            // console.log(dateArrayNumbers);
            var monthsArray = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
            ]

            var jsDate = new Date(dateArrayNumbers[0], dateArrayNumbers[1], dateArrayNumbers[2]);

            var theMonth = jsDate.getMonth();
            var dateReadableString = monthsArray[theMonth] + " " + jsDate.getDate() + " " + jsDate.getFullYear();


            var appointment = new Parse.Appointment({
                date: jsDate,
                description: this.el.querySelector(".sendrequest textarea[name='concerns']").value,
                dateReadable: dateReadableString
            });


            console.log(appointment); //same as console.log(data) below
            appointment.setACL(acl);
            appointment.save().then(function(data) {
                console.log(data); //same as console.log(appointment) above
                // id =appointment.id
                console.log('save successful');
                alert("Appointment Request Submitted");
            });

        }
    })

    Parse.ScheduleView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "schedule"
    })

    Parse.NotesView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "notes"
    })

    Parse.PatientNotesView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "bootstrap-notes",
        events: {
            "submit .savepersonalnotes": "savenotes"
        },
        savenotes: function(event) {
            event.preventDefault();
            var loggedInUser = Parse.User.current();
            var acl = new Parse.ACL(loggedInUser);
            var note = new Parse.Appointment({

                notes: this.el.querySelector(".savepersonalnotes textarea[name='visitnotes']").value

            });


            console.log(note); //same as console.log(data) below
            note.setACL(acl);
            note.save().then(function(data) {
                console.log(data); //same as console.log(appointment) above
                // id =appointment.id
                console.log('save successful');
                alert("Personal Note Saved");
            });

        }
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
                window.location.hash = "#dashboard"  //   +"/"+this.model.get('id')
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
