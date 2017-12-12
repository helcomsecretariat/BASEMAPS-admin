package fi.fta.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class IndexController
{
	
	@RequestMapping("/index.do")
	public String show(ModelMap model)
	{
		return "index";
	}
	
}
