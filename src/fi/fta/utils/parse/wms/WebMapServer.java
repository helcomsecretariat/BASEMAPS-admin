package fi.fta.utils.parse.wms;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import fi.fta.beans.Pair;
import fi.fta.utils.JsonUtils;
import fi.fta.utils.Util;

/**
 * Main parse helper extracting WMS from it's remote source.
 * 
 * @author andrysta
 *
 */
public class WebMapServer
{
	
	public static String DEFAULT_LANGUAGE = "eng";
	
	public static final String JSON_FORMAT = "application/json";
	public static final String GEOJSON_FORMAT = "application/geojson";
	public static final String XML_FORMAT = "text/xml";
	public static final String GML_FORMAT = "application/vnd.ogc.gml";
	
	
	private URL url;
	
	private Specification specification;
	
	private FeatureInfo featureInfo;
	
	private Layer layer;
	
	
	public WebMapServer(String url) throws MalformedURLException, IOException, DocumentException
	{
		this(url, WebMapServer.DEFAULT_LANGUAGE);
	}
	
	public WebMapServer(String url, String defaultLanguage) throws MalformedURLException, IOException, DocumentException
	{
		this.url = new URL(WebMapServer.composeCapabilitiesUrl(url, defaultLanguage));
		Document doc = new SAXReader().read(this.url);
		if (doc != null)
		{
			Element root = doc.getRootElement();
			this.decideSpecification(root);
			if (this.specification != null)
			{
				this.featureInfo = new FeatureInfo(root, specification);
				this.layer = new Layer(root, specification);
			}
		}
	}
	
	/**
	 * Get WMS version (specification) from XML element.
	 * 
	 * @param root XML element
	 */
	private void decideSpecification(Element root)
	{
		List<Specification> specifications = Arrays.asList(
			new WMS_1_3_0(), new WMS_1_1_1(), new WMS_1_1_0(), new WMS_1_0_0());
		Iterator<Specification> it = specifications.iterator();
		while (specification == null && it.hasNext())
		{
			Specification s = it.next();
			if (s.getRootName().equalsIgnoreCase(root.getName()) &&
				s.getVersion().equalsIgnoreCase(root.attributeValue("version")))
			{
				specification = s;
			}
		}
	}
	
	public URL getUrl() {
		return url;
	}

	public void setUrl(URL url) {
		this.url = url;
	}
	
	/**
	 * Get the service version.
	 * 
	 * @return specification object
	 */
	public Specification getSpecification() {
		return specification;
	}

	public void setSpecification(Specification specification) {
		this.specification = specification;
	}
	
	public boolean hasSpecification(){
		return this.specification != null;
	}
	
	public FeatureInfo getFeatureInfo() {
		return featureInfo;
	}

	public void setFeatureInfo(FeatureInfo featureInfo) {
		this.featureInfo = featureInfo;
	}
	
	/**
	 * Get service layers which has names.
	 * 
	 * @return list of layers
	 */
	public List<Layer> getNamedLayers()
	{
		List<Layer> ret = new ArrayList<>();
		if (layer != null)
		{
			for (Layer l : WebMapServer.allChildren(layer))
			{
				if (!Util.isEmptyString(l.getName()))
				{
					ret.add(l);
				}
			}
		}
		return ret;
	}
	
	/**
	 * Apply required or default parameters to a query of specific capabilities URL of WMS.
	 * 
	 * @param url URL to apply query
	 * @param language language parameter
	 * @return constructed full URL
	 */
	private static String composeCapabilitiesUrl(String url, String language)
	{
		String[] parts = url.split("\\?");
		String u = parts[0];
		String q = parts.length > 1 ? parts[1] : "";
		Map<String, Set<String>> params = Util.mapParameters(q);
		params.put("SERVICE", Collections.singleton("WMS"));
		params.put("REQUEST", Collections.singleton("GetCapabilities"));
		if (!params.containsKey("LANGUAGE") && language != null)
		{
			params.put("LANGUAGE", Collections.singleton(language));
		}
		return u + "?" + Util.composeQuery(params);
	}
	
	/**
	 * Get WMS feature info from remote server.
	 * 
	 * @param url service URL
	 * @param formats available formats
	 * @return content object and format
	 * @throws MalformedURLException remote exception
	 * @throws IOException input exception
	 */
	public static Pair<Object, String> readFeatureInfo(String url, List<String> formats) throws MalformedURLException, IOException 
	{
		String format = WebMapServer.decideFormat(formats);
		if (url == null || format == null)
		{
			return null;
		}
		URL u = new URL(WebMapServer.composeFeatureUrl(url, format));
		BufferedReader in = new BufferedReader(new InputStreamReader(u.openStream()));
		StringBuilder sb = new StringBuilder();
		String inputLine;
        while ((inputLine = in.readLine()) != null)
        {
        	sb.append(inputLine).append("\r\n");
        }
        in.close();
        switch (format)
        {
        	case WebMapServer.JSON_FORMAT:
        	case WebMapServer.GEOJSON_FORMAT:
        		return new Pair<>(JsonUtils.toObject(sb.toString(), Object.class), format);
        	case WebMapServer.XML_FORMAT:
        		try
        		{
        			Document doc = new SAXReader().read(new StringReader(sb.toString()));
            		if (doc != null &&
            			FeatureInfoFormatXmlTypeSpecification.isRootElement(doc.getRootElement()))
            		{
            			return new Pair<>(new FeatureInfoFormatXmlType(doc.getRootElement()), format);
            		}
        		}
        		catch (DocumentException ex)
        		{
					// TODO: handle exception
				}
        	case WebMapServer.GML_FORMAT:
        	default:
        		return new Pair<>(sb.toString(), format);
        }
	}
	
	/**
	 * Apply required or default parameters to a query of specific feature URL of WMS.
	 * 
	 * @param url URL to apply query
	 * @param format info format
	 * @return constructed full URL
	 */
	private static String composeFeatureUrl(String url, String format)
	{
		String[] parts = url.split("\\?");
		String u = parts[0];
		String q = parts.length > 1 ? parts[1] : "";
		Map<String, Set<String>> params = Util.mapParameters(q);
		params.put("SERVICE", Collections.singleton("WMS"));
		params.put("REQUEST", Collections.singleton("GetFeatureInfo"));
		params.put("INFO_FORMAT", Collections.singleton(format));
		return u + "?" + Util.composeQuery(params);
	}
	
	/**
	 * Choose on format from a list of available formats.
	 * 
	 * @param formats available formats
	 * @return the chosen format
	 */
	private static String decideFormat(List<String> formats)
	{
		if (!Util.isEmptyCollection(formats))
		{
			Set<String> fs = new HashSet<>(formats);
			if (fs.contains(WebMapServer.JSON_FORMAT))
			{
				return WebMapServer.JSON_FORMAT;
			}
			else if (fs.contains(WebMapServer.GEOJSON_FORMAT))
			{
				return WebMapServer.GEOJSON_FORMAT;
			}
			else if (fs.contains(WebMapServer.XML_FORMAT))
			{
				return WebMapServer.XML_FORMAT;
			}
			else if (fs.contains(WebMapServer.GML_FORMAT))
			{
				return WebMapServer.GML_FORMAT;
			}
			
			return formats.iterator().next();
		}
		return null;
	}
	
	/**
	 * Recursively list all children layers of one layer.
	 * 
	 * @param layer parent layer
	 * @return list of all children layers
	 */
	private static List<Layer> allChildren(Layer layer)
	{
		List<Layer> ret = new ArrayList<>();
		ret.add(layer);
		if (!Util.isEmptyCollection(layer.getLayers()))
		{
			for (Layer l : layer.getLayers())
			{
				ret.addAll(WebMapServer.allChildren(l));
			}
		}
		return ret;
	}
	
}
