package fi.fta.utils.translation;

import fi.fta.beans.Pair;

public interface TranslateService
{

	public Pair<String, String> translate(String text, String from, String to) throws Exception;
	
}
