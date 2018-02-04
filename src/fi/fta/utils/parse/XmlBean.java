package fi.fta.utils.parse;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import org.dom4j.Element;

public class XmlBean<T> implements XmlParse<T>
{
	
	public XmlBean()
	{}
	
	public XmlBean(Element root, T specification)
	{
		this.fromElement(root, specification);
	}
	
	@Override
	public void fromElement(Element root, T specification)
	{}
	
	public static Element element(Element root, String path)
	{
		Element ret = null;
		List<String> names = Arrays.asList(path.split("/"));
		Iterator<String> it = names.iterator();
		while (it.hasNext())
		{
			ret = root.element(it.next());
			if (ret != null)
			{
				root = ret;
			}
		}
		return ret;
	}
	
	public static String elementText(Element root, String path)
	{
		Element ret = XmlBean.element(root, path);
		return ret != null ? ret.getText() : null;
	}
	
	public static List<Element> elements(Element root, String path)
	{
		Element el = null;
		List<String> names = Arrays.asList(path.split("/"));
		Iterator<String> it = names.iterator();
		while (it.hasNext())
		{
			el = root.element(it.next());
			if (el != null)
			{
				root = el;
			}
		}
		List<Element> ret = new ArrayList<>();
		if (el != null && el.getParent() != null)
		{
			for (Object o : el.getParent().elements(el.getName()))
			{
				ret.add((Element)o);
			}
		}
		return ret;
	}
	
}
