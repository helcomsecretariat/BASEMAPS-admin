package fi.fta.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import fi.fta.beans.ArcGISService;
import fi.fta.data.managers.SimpleUrlServiceManager;

/**
 * Controller wrapper for ArcGIS simple URL services
 * 
 * @author andrysta
 *
 */
@Controller
@RequestMapping("/ags")
public class ArcGISServicesController
	extends ServicesController<ArcGISService, SimpleUrlServiceManager<ArcGISService>>
{
	
	public ArcGISServicesController()
	{
		super(SimpleUrlServiceManager.getArcGISInstance());
	}
	
}
