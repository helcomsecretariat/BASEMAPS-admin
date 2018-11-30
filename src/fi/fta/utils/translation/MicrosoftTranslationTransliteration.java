package fi.fta.utils.translation;

import java.io.Serializable;

public class MicrosoftTranslationTransliteration implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -7790735745017936992L;
	
	
	private String script;
	
	private String text;
	
	
	public MicrosoftTranslationTransliteration()
	{}
	
	public String getScript() {
		return script;
	}

	public void setScript(String script) {
		this.script = script;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}
	
}
