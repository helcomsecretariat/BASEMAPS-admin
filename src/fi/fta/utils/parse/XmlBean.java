package fi.fta.utils.parse;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.LinkedList;
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
		List<Element> ret = new ArrayList<>();
		LinkedList<String> names = new LinkedList<>(Arrays.asList(path.split("/")));
		String name = names.removeFirst();
		if (names.isEmpty())
		{
			for (Object o : root.elements(name))
			{
				ret.add((Element)o);
			}
		}
		else
		{
			for (Object o : root.elements(name))
			{
				ret.addAll(XmlBean.elements((Element)o, String.join("/", names)));
			}
		}
		return ret;
	}
	
}
