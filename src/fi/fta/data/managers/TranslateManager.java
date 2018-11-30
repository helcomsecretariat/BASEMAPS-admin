package fi.fta.data.managers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.log4j.Logger;

import fi.fta.beans.ServiceLayerBean;
import fi.fta.utils.Languages;
import fi.fta.utils.Util;
import fi.fta.utils.translation.MicrosoftTranslateService;
import fi.fta.utils.translation.TranslateService;

/**
 * Translations helper for infos of services.
 * Communicates with Microsoft translation service.
 * 
 * @author andrysta
 *
 */
public class TranslateManager implements Languages
{
	
	protected static Logger logger = Logger.getLogger(TranslateManager.class);
	
	
	protected Map<String, String> cache;
	
	protected Map<String, Locale> languages;
	
	protected TranslateService service;
	
	protected static TranslateManager instance;
	
	public static TranslateManager getInstance()
	{
		if (instance == null)
		{
			synchronized (TranslateManager.class)
			{
				if (instance == null)
				{
					instance = new TranslateManager();
				}
			}
		}
		return instance;
	}
	
	protected TranslateManager()
	{
		cache = new HashMap<>();
		languages = new HashMap<>();
		for (String c : Locale.getISOLanguages())
		{
			Locale l = new Locale(c);
			languages.put(l.getISO3Language(), l);
		}
		service = new MicrosoftTranslateService();
	}
	
	public void translate(ServiceLayerBean bean)
	{
		String language = !Util.isEmptyCollection(bean.getLanguages()) ?
			bean.getLanguages().get(0) : null;
		bean.setTitleEn(this.translate(bean.getTitle(), language));
		List<String> keywords = new ArrayList<>();
		for (String keyword : bean.getKeywords())
		{
			keywords.add(this.translate(keyword, language));
		}
		bean.setKeywordsEn(keywords);
		bean.setDescriptionEn(this.translate(bean.getDescription(), language));
		bean.setFeesEn(this.translate(bean.getFees(), language));
		bean.setAccessConstraintsEn(this.translate(bean.getAccessConstraints(), language));
	}
	
	public String translate(String text, String language)
	{
		if (language == null ||
			!language.equalsIgnoreCase(TranslateManager.DEFAULT_ISO_639_1) &&
			!language.equalsIgnoreCase(TranslateManager.DEFAULT_ISO_639_2))
		{
			String l = language != null && languages.containsKey(language) ?
				languages.get(language).getLanguage() : language;
			return this.translate(text, l, TranslateManager.DEFAULT_ISO_639_1);
		}
		return text;
	}
	
	/**
	 * Uses remote translate service and translates a text from one language to another
	 * 
	 * @param text a text to translate
	 * @param from language to translate from
	 * @param to language to translate to
	 * @return a translated text
	 */
	private String translate(String text, String from, String to)
	{
		if (Util.isEmptyString(text))
		{
			return text;
		}
		if (!cache.containsKey(text))
		{
			try
			{
				cache.put(text, service.translate(text, from, to));
			}
			catch (Exception ex)
			{
				logger.error("TranslateManager.service.translate(" + text + ")", ex);
			}
		}
		return cache.get(text);
	}
	
	/**
	 * Clear cached translations
	 */
	public void clearCache()
	{
		cache.clear();
	}
	
}
