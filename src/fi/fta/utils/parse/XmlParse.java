package fi.fta.utils.parse;

import org.dom4j.Element;

public interface XmlParse<T>
{
	
	public void fromElement(Element root, T specification);
	
}
