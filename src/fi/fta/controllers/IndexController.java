package fi.fta.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Example of controller for web page. Not used at the moment.
 * 
 * @author andrysta
 *
 */
@Controller
public class IndexController
{
	
	@RequestMapping("/index.do")
	public String show(ModelMap model)
	{
		return "index";
	}
	
}
