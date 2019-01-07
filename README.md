# ImageAnnotator

ImageAnnotator is a mediawiki extension to integrate an image editor in image added with PageForm extension

# Installation

See documentation of Page Forms to install it.

Extract an put ImageAnnotator  in the 'extensions' directory.

Include it in LocalSettings.php :
```php
 wfLoadExtension( 'ImageAnnotator' );
 ```

It has be tested on mediawiki 1.28

# Usage

First, edit your form, and add an input to contain annotations datas.
So for instance, if you have an image in your form : 
```
{{{field|Main_Picture|uploadable|size=25|image preview}}}
 ```
 
Then change it to add the annotation input : 
```
{{{field|Main_Picture|uploadable|image preview}}}
{{{field|Main_Picture_annotation|input type=editableImage|target=Main_Picture}}}
 ```
 
It's important to set the target param, using the name of the image attribute. Note that you must put it close to your image attribut, and use the 'image preview' param.
 
 Then, in your templafe, to show the image with his annotations, use the following parser function :

```
{{#annotatedImage:[[File:{{{Main_Picture}}}|frameless|border]]|{{{Main_Picture_annotation}}}}}
 ```
 
 
# Credits

This extension was written by Pierre Boutet.

