package fi.fta.utils.translation;

import java.io.Serializable;

public class MicrosoftTranslationTranslation implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 8332786757765991056L;
	
	
	private String text;
	
	private MicrosoftTranslationTransliteration transliteration;
	
	private String to;
	
	
	public MicrosoftTranslationTranslation()
	{}
	
	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public MicrosoftTranslationTransliteration getTransliteration() {
		return transliteration;
	}

	public void setTransliteration(MicrosoftTranslationTransliteration transliteration) {
		this.transliteration = transliteration;
	}

	public String getTo() {
		return to;
	}

	public void setTo(String to) {
		this.to = to;
	}
	
}
