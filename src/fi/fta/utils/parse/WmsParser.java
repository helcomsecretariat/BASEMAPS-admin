package fi.fta.utils.parse;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

@Deprecated
public class WmsParser {
	
	public static void parseXML() throws Exception {
		//String url = "http://inspire.maaamet.ee/arcgis/rest/services/public/au/MapServer/exts/InspireView/service?SERVICE=WMS&REQUEST=GetCapabilities";
		String url = "https://services.kortforsyningen.dk/service?SERVICE=WMS&REQUEST=GetCapabilities&SERVICENAME=dagi&LOGIN=helcom&PASSWORD=KarttaPalvelu4!";
		
		Document doc = getXMLDocument(url);

		if (doc != null) {
			String v = getVersion(doc);
			System.out.println("Version: " + v);
			/*
			String a = getAbstract(doc);
			System.out.println("Abstract: " + a);
			
			List<String> names = getLayerNames(doc);
			for (String n : names) {
			    System.out.println("Layer name: " + n);
			}
			
			String d = getDefaultLanguage(doc);
			System.out.println("Default language: " + d);
			
			List<String> languages = getSupportedLanguages(doc);
			for (String l : languages) {
			    System.out.println("Supported language: " + l);
			}
			*/
		}	
	  
	}

	private static Document getXMLDocument(String s)  throws Exception {
		URL url = new URL(s);
		
		HttpURLConnection con = (HttpURLConnection) url.openConnection();
		int responseCode = con.getResponseCode();
		
		if (responseCode == 200) {
			BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
			String inputLine;
			StringBuffer response = new StringBuffer();
			while ((inputLine = in.readLine()) != null) {
				response.append(inputLine);
			}
			in.close();
			
			return DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new InputSource(new StringReader(response.toString())));
		}
		else 
			return null;
	}	
	
	private static String getVersion(Document doc) {
		NodeList nodes130 = doc.getElementsByTagName("WMS_Capabilities");
		NodeList nodes111 = doc.getElementsByTagName("WMT_MS_Capabilities");
		
		String v = null;
        if (nodes130.getLength() > 0) {
        	Element vEl = (Element) nodes130.item(0);
        	v =  vEl.getAttribute("version");
        }
        else if (nodes111.getLength() > 0) {
        	Element vEl = (Element) nodes111.item(0);
        	v =  vEl.getAttribute("version");
        }
        return v;
	}	
	/*
	private static String getAbstract(Document doc) {
		NodeList nodes = doc.getElementsByTagName("Abstract");
		String a = null;
        if (nodes.getLength() > 0) {
        	a =  nodes.item(0).getTextContent();
        }
        return a;
	}	
	
	private static List<String> getLayerNames(Document doc) {
		NodeList lNodes = doc.getElementsByTagName("Layer");
		List<String> names = new ArrayList<String>();
		for (int i = 0; i < lNodes.getLength(); i++) {
			Element lEl = (Element) lNodes.item(i);
    		NodeList nNodes = lEl.getElementsByTagName("Name");
    		String n;
    		if (nNodes.getLength() > 0) {
    			n =  nNodes.item(0).getTextContent();
    			names.add(n);
    		}
		}
		return names;
	}	
	
	private static String getDefaultLanguage(Document doc) {
		NodeList dlNodes = doc.getElementsByTagName("DefaultLanguage");
		String dl = null;
        if (dlNodes.getLength() > 0) {
        	Element dlElement = (Element) dlNodes.item(0);
        	NodeList lNodes = dlElement.getElementsByTagName("Language");
        	if (lNodes.getLength() > 0) {
        		dl = lNodes.item(0).getTextContent();
        	}
        }
        return dl;
	}
	
	private static List<String> getSupportedLanguages(Document doc) {
		NodeList slNodes = doc.getElementsByTagName("SupportedLanguage");
		List<String> sls = new ArrayList<String>();
		for (int i = 0; i < slNodes.getLength(); i++) {
			Element slEl = (Element) slNodes.item(i);
    		NodeList lNodes = slEl.getElementsByTagName("Language");
    		String l;
    		if (lNodes.getLength() > 0) {
    			l =  lNodes.item(0).getTextContent();
    			sls.add(l);
    		}
		}
		return sls;
	}	
	*/
}
