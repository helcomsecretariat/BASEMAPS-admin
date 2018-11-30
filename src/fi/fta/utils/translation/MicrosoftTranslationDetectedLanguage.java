package fi.fta.utils.translation;

import java.io.Serializable;

public class MicrosoftTranslationDetectedLanguage implements Serializable
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -3300988895731529393L;
	
	
	private String language;
	
	private Float score;
	
	
	public MicrosoftTranslationDetectedLanguage()
	{}
	
	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public Float getScore() {
		return score;
	}

	public void setScore(Float score) {
		this.score = score;
	}
	
}
