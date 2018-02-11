package fi.fta.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import fi.fta.beans.WMS;
import fi.fta.data.managers.WMSManager;

@Controller
@RequestMapping("/wms")
public class WMSesController extends ServicesController<WMS, WMSManager>
{
	
	public WMSesController()
	{
		super(WMSManager.getInstance());
	}
	
}
