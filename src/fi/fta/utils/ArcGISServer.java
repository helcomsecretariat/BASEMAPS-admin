package fi.fta.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URL;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.io.SAXReader;

import fi.fta.beans.Pair;
import fi.fta.utils.parse.wms.FeatureInfoFormatXmlType;
import fi.fta.utils.parse.wms.FeatureInfoFormatXmlTypeSpecification;
import fi.fta.utils.parse.wms.WebMapServer;

public class ArcGISServer
{
	public static final String JSON_FORMAT = "json";
	public static final String XML_FORMAT = "xml";
	
	private URL url;
	
	public ArcGISServer(String url) throws MalformedURLException, IOException, DocumentException
	{
		
	}
		
	public URL getUrl() {
		return url;
	}

	public void setUrl(URL url) {
		this.url = url;
	}

	public static Pair<Object, String> getInfo(String url, String format) throws MalformedURLException, IOException 
	{
		if (url == null)
		{
			return null;
		}
		URL u = new URL(url);
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
        	case ArcGISServer.JSON_FORMAT:
        		return new Pair<>(JsonUtils.toObject(sb.toString(), Object.class), "json");
        	case ArcGISServer.XML_FORMAT:
        	default:
        		return new Pair<>(sb.toString(), format);
        }
        
	}
}
