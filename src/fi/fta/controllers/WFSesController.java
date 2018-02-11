package fi.fta.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import fi.fta.beans.WFS;
import fi.fta.data.managers.WFSManager;

@Controller
@RequestMapping("/wfs")
public class WFSesController extends ServicesController<WFS, WFSManager>
{
	
	public WFSesController()
	{
		super(WFSManager.getInstance());
	}
	
}
