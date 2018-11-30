package fi.fta.utils.translation;

import java.io.Serializable;
import java.util.List;

public class MicrosoftTranslation implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -3538273209330506220L;
	
	
	private MicrosoftTranslationDetectedLanguage detectedLanguage;
	
	private List<MicrosoftTranslationTranslation> translations;
	
	
	public MicrosoftTranslation()
	{}
	
	public MicrosoftTranslationDetectedLanguage getDetectedLanguage() {
		return detectedLanguage;
	}

	public void setDetectedLanguage(MicrosoftTranslationDetectedLanguage detectedLanguage) {
		this.detectedLanguage = detectedLanguage;
	}

	public List<MicrosoftTranslationTranslation> getTranslations() {
		return translations;
	}

	public void setTranslations(List<MicrosoftTranslationTranslation> translations) {
		this.translations = translations;
	}
	
}
