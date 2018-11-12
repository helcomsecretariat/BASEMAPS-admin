package fi.fta.utils.parse;

import org.dom4j.Element;

/**
 * Common parser which uses specification for extracting data from XML element.
 * 
 * @author andrysta
 *
 * @param <T> specification class
 */
public interface XmlParse<T>
{
	
	/**
	 * Extract data from XML element and subelements using a specification.
	 * 
	 * @param root XML element
	 * @param specification version specification
	 */
	public void fromElement(Element root, T specification);
	
}
