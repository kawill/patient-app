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
            this.notesLog = new Parse.NotesCollectionLog();
            this.notesView = new Parse.NotesView({
                collection: this.notesLog
            });

            this.patientHomeView = new Parse.PatientHomeView({
                collection: this.appointments
            });
            this.notes = new Parse.NotesCollection();
            // Parse.NotesCollection has model: Parse.Appointment
            this.patientNotesView = new Parse.PatientNotesView({
                collection: this.notes
            });

            this.scheduleView = new Parse.ScheduleView();
            this.notesView = new Parse.NotesView();
            this.loginView = new Parse.LoginView();
            this.logoutView = new Parse.LogoutView();
            this.afterlogoutView = new Parse.AfterLogoutView();

            Parse.history.start();
        },
        routes: {
            "login": "login",
            "logout": "loadLogout",
            "loggedout": "logoutcomplete",
            "dashboard": "patienthome",
            "apptrequest": "loadApptrequest",
            "notes/:noteId": "loadVistNotes",
            // "schedule": "schedule",
            "notes": "loadNotesLog",
            // "dashboard/*notes/:noteId": "loadVistNotes",
            // "dashboard/:id/notes/:noteId": "loadVistNotes",
            // "dashboard/:id": "patienthome",
            "*default": "home"
        },
        login: function() {
            this.loginView.render();
        },
        loadLogout: function() {
            this.logoutView.render();
        },
        logoutcomplete: function() {
            this.afterlogoutView.render();
        },
        patienthome: function() {
            var self = this;
            // self = router
            this.appointments.fetch().then(function(collectionResult) {
                // the result should be a Parse.Collection, hopefully
                self.patientHomeView.collection = collectionResult;
                self.patientHomeView.render();
                // self because it needs to be a part of this model, new function
            });
        },
        loadApptrequest: function() {
            var self = this;
            // self = router
            this.appointments.fetch().then(function(collectionResult) {
                // the result should be a Parse.Collection, hopefully
                self.apptRequestView.collection = collectionResult;
                self.apptRequestView.render();
                // self because it needs to be a part of this model, new function
            });
        },
        loadNotesLog: function(){
            var self = this;
            this.notes.fetch().then(function(collectionofNotes) {
                self.notesView.collection = collectionofNotes;
                self.notesView.render();
            })
        },
        loadVistNotes: function(noteId) { //userId, noteId
            console.log(noteId + " passed to handler");
            // userId/notes passed not userId/notes/specific_noteId
            var self = this;
            // self = router
            // this.appointments.fetch(noteId).then(function(collectionResult) {
            //     // the result should be a Parse.Collection, hopefully
            //     self.patientNotesView.collection = collectionResult;
            //     self.patientNotesView.render();
            //     // self because it needs to be a part of this model, new function
            // });

            // instead... maybe?
            var model = new Parse.Appointment({
                id: noteId
            });
            console.log(model);
            model.fetch().then(function() {
                self.patientNotesView.model = model;
                self.patientNotesView.render();
            });
        },
        // schedule: function() {
        //     this.scheduleView.render();
        // },
        // notes: function() {
        //     this.notesView.render();
        // },
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
            apptName: "",
            id: "",
            notes: "",
            doctorNotes: "",
            user: null,
            occurred: false,
            firstname: "",
            lastname: ""
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
        model: Parse.Appointment,
        comparator: function(a, b){
            // return (a.get('date') > b.get('date')) ? 1 : -1 //most date last
            return (a.get('date') < b.get('date')) ? 1 : -1 //upcoming, most recent date first
        }
    })

    Parse.NotesCollection = Parse.Collection.extend({
        model: Parse.Appointment,
        comparator: function(a, b){
            return (a.get('date') < b.get('date')) ? 1 : -1 //upcoming, most recent date first
        }
            // model: Parse.Note
    })

    Parse.NotesCollectionLog = Parse.Collection.extend({
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
                // console.log(parseInt(numberString));
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
                apptName: this.el.querySelector(".sendrequest input[name='apptname']").value,
                dateReadable: dateReadableString
            });


            // console.log(appointment); //same as console.log(data) below
            appointment.setACL(acl);
            appointment.save().then(function(data) {
                // console.log(data); //same as console.log(appointment) above
                // id =appointment.id
                // console.log('save successful');
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
        view: "bootstrap-notes-log"
    })

    Parse.PatientNotesView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "bootstrap-notes",
        events: {
            "submit .savingpersonalnotes": "savenotes"
        },
        savenotes: function(event) {
            event.preventDefault();


            this.model.set('notes', this.el.querySelector(".savingpersonalnotes textarea[name='visitnotes']").value)
            this.model.save().then(function(data) {
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
            result.then(function(data) {
                // console.log(data)
                window.location.hash = "#dashboard" //   +"/"+this.model.get('id')
            })
        },
        register: function(event) {
            event.preventDefault();
            var data = {
                username: this.el.querySelector(".patientRegister input[name='email']").value,
                password: this.el.querySelector(".patientRegister input[name='password']").value,
                passwordrepeat: this.el.querySelector(".patientRegister input[name='passwordrepeat']").value,
                firstname: this.el.querySelector(".firstname input[name='firstname']").value,
                lastname: this.el.querySelector(".firstname input[name='lastname']").value
            }

            var user = new Parse.User();
            user.set('username', data.username);
            // user.set('email', data.username)
            user.set('password', data.password);

            // var result = user.registered() documentation?
            var result = user.signUp()
            result.then(function(user) {
                // window.location.hash = "#dashboard/" + data.id
                window.location.hash = "#dashboard"
            })
        }
    })

    Parse.LogoutView = Parse.TemplateView.extend({
        el:".wrapper",
        view: "bootstrap-patient-logout",
        events: {
            "submit .patientLogout": "logout"
        },
        logout: function(event) {
            event.preventDefault();
            console.log(this);
            Parse.User.logOut();
            window.location.hash = "#loggedout";
            // Parse.User.logOut().then(function(){
            //     window.location.hash = "#loggedout"
            // });
        }
    })

    Parse.AfterLogoutView = Parse.TemplateView.extend({
        el: ".wrapper",
        view: "bootstrap-after-patient-logout"
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
