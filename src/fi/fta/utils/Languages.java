package fi.fta.utils;

import java.util.Locale;
import java.util.Map;

import fi.fta.beans.Pair;

public interface Languages
{

	/**
	 * Default language to translate to (english).
	 */
	public static String DEFAULT_ISO_639_1 = "en";
	
	/**
	 * Default language for WMS and WFS requests.
	 */
	public static String DEFAULT_ISO_639_2 = "eng";
	
	public static Map<String, Locale> ISO_639_2B = CollectionsUtils.map(
		Pair.get("ger", new Locale("de")),
		Pair.get("dut", new Locale("nl")),
		Pair.get("fre", new Locale("fr")),
		Pair.get("ice", new Locale("is")));
	
}
