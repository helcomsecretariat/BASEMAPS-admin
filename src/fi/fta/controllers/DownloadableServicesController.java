package fi.fta.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import fi.fta.beans.DownloadableService;
import fi.fta.data.managers.SimpleUrlServiceManager;

/**
 * Controller wrapper for downloadable simple URL services
 * 
 * @author andrysta
 *
 */
@Controller
@RequestMapping("/dls")
public class DownloadableServicesController
	extends ServicesController<DownloadableService, SimpleUrlServiceManager<DownloadableService>>
{
	
	public DownloadableServicesController()
	{
		super(SimpleUrlServiceManager.getDownloadableInstance());
	}
	
}
