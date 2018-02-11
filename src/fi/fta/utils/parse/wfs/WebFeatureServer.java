package fi.fta.utils.parse.wfs;

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
import fi.fta.utils.parse.XmlBean;

public class WebFeatureServer
{
	
	public static String DEFAULT_LANGUAGE = "eng";
	
	
	private URL url;
	
	private Specification specification;
	
	private FeatureInfo featureInfo;
	
	private List<FeatureType> types;
	
	
	public WebFeatureServer(String url) throws MalformedURLException, IOException, DocumentException
	{
		this(url, WebFeatureServer.DEFAULT_LANGUAGE);
	}
	
	public WebFeatureServer(String url, String defaultLanguage) throws MalformedURLException, IOException, DocumentException
	{
		this.url = new URL(WebFeatureServer.composeUrl(url, defaultLanguage));
		Document doc = new SAXReader().read(this.url);
		if (doc != null)
		{
			Element root = doc.getRootElement();
			this.decideSpecification(root);
			if (this.specification != null)
			{
				this.featureInfo = new FeatureInfo(root, specification);
				this.types = new ArrayList<>();
				for (Element ft : XmlBean.elements(root, specification.getPathFeatureType()))
				{
					this.types.add(new FeatureType(ft, specification));
				}
			}
		}
	}
	
	private void decideSpecification(Element root)
	{
		List<Specification> specifications = Arrays.asList(
			new WFS_2_0_0(), new WFS_1_1_0(), new WFS_1_0_0());
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
	
	public List<FeatureType> getNamedFeatureTypes()
	{
		List<FeatureType> ret = new ArrayList<>();
		if (types != null)
		{
			for (FeatureType ft : types)
			{
				if (!Util.isEmptyString(ft.getName()))
				{
					ret.add(ft);
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
		params.put("SERVICE", Collections.singleton("WFS"));
		params.put("REQUEST", Collections.singleton("GetCapabilities"));
		if (!params.containsKey("LANGUAGE") && language != null)
		{
			params.put("LANGUAGE", Collections.singleton(language));
		}
		return u + "?" + Util.composeQuery(params);
	}
	
}
