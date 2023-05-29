package com.michijs.plugins.hibridapputils;

import android.content.Intent;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;

class JavaScriptInterface {
  public Uri openedFileUri;
  private final MichijsMainActivity context;
  private final FileUtils fileUtils;

  JavaScriptInterface(MichijsMainActivity context) {
    this.context = context;
    this.fileUtils = new FileUtils(context);
  }

  @JavascriptInterface
  public void showSaveFilePicker(String suggestedName, String suggestedType) {
    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    intent.setType(suggestedType);
    intent.putExtra(Intent.EXTRA_TITLE, suggestedName);

    context.saveFileLauncher.launch(intent);
  }

  @JavascriptInterface
  public void showOpenFilePicker(String suggestedType) {
    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    intent.setType(suggestedType);

    context.openFileLauncher.launch(intent);
  }

  @JavascriptInterface
  public void saveOpenedFile(String content) {
    fileUtils.saveFile(openedFileUri, content);
  }

  @JavascriptInterface
  public String getOpenedFileContent() {
    return fileUtils.readFile(openedFileUri);
  }

  @JavascriptInterface
  public String getOpenedFileName() {
    return fileUtils.getName(openedFileUri);
  }

  @JavascriptInterface
  public String getOpenedFileType() {
    return fileUtils.getType(openedFileUri);
  }

  @JavascriptInterface
  public void share(String jsonString) {
    try {
      // Convert the JSON string to a Java object
      JSONObject jsonObject = new JSONObject(jsonString);

      // Access the values from the JSON object
      JSONArray files = jsonObject.optJSONArray("files");
      String text = jsonObject.optString("text");
      String title = jsonObject.optString("title");
      String url = jsonObject.optString("url");

      String action;
      if (files != null && files.length() > 1) {
        action = Intent.ACTION_SEND_MULTIPLE;
      } else {
        action = Intent.ACTION_SEND;
      }

      Intent shareIntent = new Intent(action);
      if (files != null) {
        ArrayList<Uri> fileUris = new ArrayList<>();
        for (int i = 0; i < files.length(); i++) {
          try {
            JSONObject hybridFileJSON = files.getJSONObject(i);
            String fileName = hybridFileJSON.getString("name");
            String fileText = hybridFileJSON.getString("text");

            File file = fileUtils.createTempFile(fileName, fileText);

            Uri uri = Uri.fromFile(file);
            fileUris.add(uri);
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
        shareIntent.putParcelableArrayListExtra(Intent.EXTRA_STREAM, fileUris);
        shareIntent.setType(fileUtils.getType(fileUris.get(0)));
      }
      if (!title.equals("")) {
        shareIntent.putExtra(Intent.EXTRA_TITLE, title);
      }
      if (!text.equals("")) {
        shareIntent.putExtra(Intent.EXTRA_TEXT, text);
      }
      if (!url.equals("")) {
        shareIntent.putExtra(Intent.EXTRA_TEXT, url);
      }

      context.shareLauncher.launch(Intent.createChooser(shareIntent, null));
    } catch (JSONException e) {
      Toast.makeText(context, "Failed to share file", Toast.LENGTH_SHORT).show();
      e.printStackTrace();
    }
  }

  public void notifySaveFilePickerResult(Boolean result) {
    WebView webView = context.getBridge().getWebView();
    webView.evaluateJavascript(
        "window.HybridInterface?.onShowSaveFilePickerHasResult?.(" + result + ")", null);
  }

  public void notifyOpenFilePickerResult(Boolean result) {
    WebView webView = context.getBridge().getWebView();
    webView.evaluateJavascript(
        "window.HybridInterface?.onShowOpenFilePickerHasResult?.(" + result + ")",
        null);
  }

  public void notifyShareResult(Boolean result) {
    WebView webView = context.getBridge().getWebView();
    webView.evaluateJavascript(
            "window.HybridInterface?.onShareHasResult?.(" + result + ")",
            null);
  }

  public void notifyNewOpenFileOpened() {
    WebView webView = context.getBridge().getWebView();
    webView.evaluateJavascript("window.HybridInterface?.onNewOpenFileOpened?.()", null);
  }
}
