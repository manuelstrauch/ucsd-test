// Task Description

// Standard Packages
importPackage(java.lang);
importPackage(java.util);
importPackage(com.cloupia.service.cIM.inframgr);
importPackage(com.cloupia.model.cIM);
importPackage(com.cloupia.service.cIM.inframgr.reservation);
importPackage(com.cloupia.service.cIM.inframgr.forms.wizard);
importPackage(java.io);
importPackage(com.cloupia.lib.util);
importPackage(com.cloupia.lib.cIaaS.vcd.api);

// Additional Packages
// importpackage(...);

// Variables
var ip = input.ip;
var user = input.user;
var pass = input.pass;
var route = input.route;
var mask = input.mask;
var gw = input.gw;
var apidone = false;

// create login function

function getService()
{
	// Here is the login action defined	
}

// logged in successfully

function doAPICall()
{
	// call the login function
	var service = getService();
	
	if(service !== null)
	{
		try 
		{
			// Configuration Part
			// Do Some configuration here
			// i.E. ip route add $route $mask $gw
			
			// Setup ssh call for i.E. add route via SSH
			var post = service.SSH(service,"route add "+ route + " " + mask + " " + gw);
		}
		catch (err)
		{
			// logout
			service.logout();
			
			logger.addError("Could not add config :" + err.message);
			ctxt.setFailed("Could not add config :" + err.message);
			ctxt.exit();
		}
		// set the boolean apidone to true for the triggering of the rollback registration
		apidone = true;
		
		return apidone;
		// logout
		service.logout();
	}
	else
	{
		logger.addError("Could not log in on :" + ip);
		ctxt.setFailed("Could not log in on :" + ip);
		ctxt.exit();
	}
}

// Call the function to execute the configuration
doAPICall();

// function to register the UndoTask in UCSD
function registerUndoTask()
{
	// Define the Task which includes the reverse code for this task.
	var undoHandler="custom_Del_Route_with_RB";
	// Get the Context from the task above
	var undoContext = ctxt.createInnerTaskContext(undoHandler);
	// Setup the variables we will handover to the rollback task
	var undoConfig = undoContext.getConfigObject();
	undoConfig.Instance = ip;
	undoConfig.user = user;
	undoConfig.pass = pass;
	undoConfig.routenet = route;
	undoConfig.routemask = mask;
	undoConfig.routegw = gw;
	
	// finally register the task
	// ctxt.getChangeTracker().undoableResourceModified(1,2,3,4,5,6)
	// 1 = Description what the rollback is doing
	// 2,3,4 = Description which displays our action in UCSD Rollback Task
	// 5 = the undoHandler == The Rollback Task we are using
	// 6 = undoConfig == The inputparameters we handover to the Rollback Task
	ctxt.getChangeTracker().undoableResourceModified("Rollback-Route","Delete Route from Host: "+input.Instance,"Delete Route from Host: "+input.Instance,"Delete Route from Host: "+input.Instance,undoHandler,undoConfig);
}

// if the config has been done successfully, we register the rollbackfunctionality

if (apidone === true)
{
	registerUndoTask();
	logger.addInfo("registerUndoTask succuessful");
}

