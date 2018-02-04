package fi.fta.utils.parse;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import fi.fta.utils.Util;

public class WebMapServer
{
	
	public static String DEFAULT_LANGUAGE = "eng";
	
	
	private URL url;
	
	private WMSSpecification specification;
	
	private FeatureInfo featureInfo;
	
	private Layer layer;
	
	
	public WebMapServer(String url) throws MalformedURLException, IOException, DocumentException
	{
		this(url, WebMapServer.DEFAULT_LANGUAGE);
	}
	
	public WebMapServer(String url, String defaultLanguage) throws MalformedURLException, IOException, DocumentException
	{
		this.url = new URL(WebMapServer.composeUrl(url, defaultLanguage));
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
	
	private void decideSpecification(Element root)
	{
		List<WMSSpecification> specifications = Arrays.asList(
			new WMS_1_3_0(), new WMS_1_1_1(), new WMS_1_1_0(), new WMS_1_0_0());
		Iterator<WMSSpecification> it = specifications.iterator();
		while (specification == null && it.hasNext())
		{
			WMSSpecification s = it.next();
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

	public WMSSpecification getSpecification() {
		return specification;
	}

	public void setSpecification(WMSSpecification specification) {
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
	
	
	private static String composeUrl(String url, String language)
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
