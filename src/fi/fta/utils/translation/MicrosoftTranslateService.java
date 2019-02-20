package fi.fta.utils.translation;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import javax.net.ssl.HttpsURLConnection;

import fi.fta.beans.Pair;
import fi.fta.utils.Encoding;
import fi.fta.utils.JsonUtils;
import fi.fta.utils.MimeFormat;
import fi.fta.utils.ProjectProperties;
import fi.fta.utils.Util;

public class MicrosoftTranslateService implements TranslateService
{
	
    private static String HOST = "https://api.cognitive.microsofttranslator.com";
    private static String PATH = "/translate";
    private static String PARAM_API_VERSION = "api-version";
    private static String PARAM_FROM = "from";
    private static String PARAM_TO = "to";
    private static String VERSION = "3.0";
    private static int TEXT_COUNT_LIMIT = 100;
	
    
    public String key;
    public Map<String, Set<String>> params;
    
	public MicrosoftTranslateService()
	{
		key = ProjectProperties.getInstance().getAzureKey();
		params = new HashMap<>();
		this.addParam(MicrosoftTranslateService.PARAM_API_VERSION, MicrosoftTranslateService.VERSION);
	}
	
	private void addParam(String name, String value)
	{
		if (value != null)
		{
			params.put(name, Collections.singleton(value));
		}
		else
		{
			params.remove(name);
		}
	}
	
	@Override
	public Pair<String, String> translate(String text, String from, String to) throws Exception
	{
		MicrosoftTranslation[] response = this.post(RequestBody.get(text), from, to);
		Pair<String, String> ret = new Pair<>();
		if (!Util.isEmptyArray(response))
		{
			List<MicrosoftTranslationTranslation> translations = response[0].getTranslations();
			if (!Util.isEmptyCollection(translations))
			{
				ret.setFirst(translations.iterator().next().getText());
			}
			MicrosoftTranslationDetectedLanguage dl = response[0].getDetectedLanguage();
			if (dl != null && dl.getLanguage() != null)
			{
				ret.setSecond(dl.getLanguage());
			}
		}
		return ret;
	}
	
	public List<Pair<String, String>> translate(List<String> texts, String from, String to) throws Exception
	{
		List<Pair<String, String>> ret = new ArrayList<>(texts.size());
		int c = 0;
		while (c * MicrosoftTranslateService.TEXT_COUNT_LIMIT < texts.size())
		{
			List<String> sub = texts.subList(
				c * MicrosoftTranslateService.TEXT_COUNT_LIMIT,
				Math.min((c + 1) * MicrosoftTranslateService.TEXT_COUNT_LIMIT, texts.size()));
			MicrosoftTranslation[] response = this.post(RequestBody.get(sub), from, to);
			if (!Util.isEmptyArray(response))
			{
				for (MicrosoftTranslation mt : response)
				{
					Pair<String, String> p = new Pair<>();
					List<MicrosoftTranslationTranslation> translations = mt.getTranslations();
					if (!Util.isEmptyCollection(translations))
					{
						p.setFirst(translations.iterator().next().getText());
					}
					MicrosoftTranslationDetectedLanguage dl = response[0].getDetectedLanguage();
					if (dl != null && dl.getLanguage() != null)
					{
						p.setSecond(dl.getLanguage());
					}
					ret.add(p);
				}
			}
			c++;
		}
		return ret;
	}
	
	private MicrosoftTranslation[] post(Object o, String from, String to) throws MalformedURLException, IOException, UnsupportedEncodingException
	{
		StringBuilder url = new StringBuilder(MicrosoftTranslateService.HOST);
		url.append(MicrosoftTranslateService.PATH);
		this.addParam(MicrosoftTranslateService.PARAM_FROM, from);
		this.addParam(MicrosoftTranslateService.PARAM_TO, to);
		url.append("?").append(Util.composeQuery(params));
		return this.post(url.toString(), o);
	}
	
	private MicrosoftTranslation[] post(String url, Object o) throws MalformedURLException, IOException, UnsupportedEncodingException
	{
		URL u = new URL(url);
		String json = JsonUtils.toJson(o);
		HttpsURLConnection connection = (HttpsURLConnection)u.openConnection();
		connection.setRequestMethod("POST");
		connection.setRequestProperty("Content-Type", MimeFormat.JSON.getType());
		connection.setRequestProperty("Content-Length", json.length() + "");
		connection.setRequestProperty("Ocp-Apim-Subscription-Key", key);
		connection.setRequestProperty("X-ClientTraceId", UUID.randomUUID().toString());
		connection.setDoOutput(true);
		
		DataOutputStream wr = new DataOutputStream(connection.getOutputStream());
		byte[] bytes = json.getBytes(Encoding.DEFAULT_ENCODING);
		wr.write(bytes, 0, bytes.length);
		wr.flush();
		wr.close();
		
		StringBuilder response = new StringBuilder();
		BufferedReader in = new BufferedReader(
			new InputStreamReader(connection.getInputStream(), Encoding.DEFAULT_ENCODING));
		String line;
		while ((line = in.readLine()) != null)
		{
		    response.append(line);
		}
		in.close();
		
		return JsonUtils.toObject(response.toString(), MicrosoftTranslation[].class);
    }
	
	
	private static class RequestBody
	{
		
		@SuppressWarnings("unused")
		public String Text;
		
		public RequestBody(String text)
		{
		    this.Text = text;
		}
		
		
		public static RequestBody[] get(String text)
		{
			return new RequestBody[]{new RequestBody(text)};
		}
		
		public static RequestBody[] get(Collection<String> text)
		{
			RequestBody[] ret = new RequestBody[text.size()];
			int i = 0;
			for (String t : text)
			{
				ret[i] = new RequestBody(t);
				i++;
			}
			return ret;
		}
		
	}
	
}
